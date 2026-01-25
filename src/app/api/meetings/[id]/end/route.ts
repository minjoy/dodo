import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardBadges } from '@/lib/badges'
import { calculateLevel } from '@/lib/utils'

// POST /api/meetings/[id]/end - 게임 종료
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

    // 모임 조회
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
      return NextResponse.json({ message: '호스트만 게임을 종료할 수 있습니다' }, { status: 403 })
    }

    // 게임이 진행 중이어야 종료 가능
    if (meeting.status !== 'PLAYING') {
      return NextResponse.json({ message: '진행 중인 게임만 종료할 수 있습니다' }, { status: 400 })
    }

    // 모든 참가자 ID (호스트 포함)
    const allPlayerIds = [meeting.hostId, ...meeting.participants.map((p) => p.userId)]

    // 트랜잭션으로 게임 종료 처리
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

      // 참가자 상태를 ATTENDED로 변경
      await tx.participant.updateMany({
        where: {
          meetingId: id,
          status: { not: 'CANCELLED' },
        },
        data: { status: 'ATTENDED' },
      })

      // 모든 참여자 meetingCount, exp 증가
      for (const userId of allPlayerIds) {
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            meetingCount: { increment: 1 },
            exp: { increment: 15 }, // 게임 완료 시 더 많은 경험치
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
    Promise.all(allPlayerIds.map((userId) => checkAndAwardBadges(userId))).catch(
      (error) => console.error('Failed to check badges:', error)
    )

    return NextResponse.json({
      success: true,
      gameEndedAt: new Date(),
      message: '게임이 종료되었습니다. 참가자들에게 익명 평점을 남겨보세요!',
    })
  } catch (error) {
    console.error('Failed to end game:', error)
    return NextResponse.json(
      { message: '게임 종료에 실패했습니다' },
      { status: 500 }
    )
  }
}
