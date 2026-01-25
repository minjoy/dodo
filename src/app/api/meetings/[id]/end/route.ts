import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardBadges } from '@/lib/badges'
import { calculateLevel } from '@/lib/utils'

// POST /api/meetings/[id]/end - 모임 종료
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id } = await params

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: {
          where: { status: { not: 'CANCELLED' } },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    // 호스트만 종료 가능
    if (meeting.hostId !== session.user.id) {
      return NextResponse.json({ message: '호스트만 모임을 종료할 수 있습니다' }, { status: 403 })
    }

    // 진행중인 모임만 종료 가능
    if (meeting.status !== 'PLAYING') {
      return NextResponse.json({ message: '진행중인 모임만 종료할 수 있습니다' }, { status: 400 })
    }

    // 모임 상태를 COMPLETED로 변경하고 참여자들 처리
    const participantIds = meeting.participants.map((p: { userId: string }) => p.userId)
    const allUserIds = [meeting.hostId, ...participantIds]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      // 모임 상태 업데이트
      await tx.meeting.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          gameEndedAt: new Date(),
        },
      })

      // 참여 상태 업데이트
      await tx.participant.updateMany({
        where: {
          meetingId: id,
          status: { not: 'CANCELLED' },
        },
        data: { status: 'ATTENDED' },
      })

      // 모든 참여자 meetingCount, exp 증가
      for (const userId of allUserIds) {
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            meetingCount: { increment: 1 },
            exp: { increment: 10 },
          },
        })

        // 레벨 업 확인
        const newLevel = calculateLevel(user.exp)
        if (newLevel > user.level) {
          await tx.user.update({
            where: { id: userId },
            data: { level: newLevel },
          })
        }
      }
    })

    // 뱃지 체크 (트랜잭션 외부에서 비동기로 실행)
    Promise.all(allUserIds.map((userId) => checkAndAwardBadges(userId))).catch(
      (error) => console.error('Failed to check badges:', error)
    )

    return NextResponse.json({ success: true, status: 'COMPLETED' })
  } catch (error) {
    console.error('Failed to end meeting:', error)
    return NextResponse.json(
      { message: '모임 종료에 실패했습니다' },
      { status: 500 }
    )
  }
}
