import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/meetings/[id]/start - 모임 시작
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

    // 호스트만 시작 가능
    if (meeting.hostId !== session.user.id) {
      return NextResponse.json({ message: '호스트만 모임을 시작할 수 있습니다' }, { status: 403 })
    }

    // 이미 시작된 모임
    if (meeting.status === 'PLAYING') {
      return NextResponse.json({ message: '이미 시작된 모임입니다' }, { status: 400 })
    }

    // 이미 완료된 모임
    if (meeting.status === 'COMPLETED') {
      return NextResponse.json({ message: '이미 완료된 모임입니다' }, { status: 400 })
    }

    // 모임 시작 1시간 전부터 시작 가능
    const now = new Date()
    const meetingDate = new Date(meeting.meetingDate)
    const oneHourBefore = new Date(meetingDate.getTime() - 60 * 60 * 1000)

    if (now < oneHourBefore) {
      return NextResponse.json({
        message: '모임 시작 1시간 전부터 시작할 수 있습니다',
        canStartAt: oneHourBefore.toISOString(),
      }, { status: 400 })
    }

    // 최소 인원 체크 (호스트 포함)
    const MIN_PARTICIPANTS = 2
    const totalParticipants = meeting.participants.length + 1 // +1은 호스트
    if (totalParticipants < MIN_PARTICIPANTS) {
      return NextResponse.json({
        message: `최소 ${MIN_PARTICIPANTS}명 이상이 모여야 시작할 수 있습니다 (현재 ${totalParticipants}명)`,
        errorType: 'MIN_PARTICIPANTS',
        current: totalParticipants,
        required: MIN_PARTICIPANTS,
      }, { status: 400 })
    }

    // 모든 참여자가 레디했는지 체크 (호스트 제외한 참여자 중)
    const notReadyParticipants = meeting.participants.filter(p => !p.isReady)
    if (notReadyParticipants.length > 0) {
      return NextResponse.json({
        message: `아직 레디하지 않은 참여자가 ${notReadyParticipants.length}명 있습니다`,
        errorType: 'NOT_ALL_READY',
        notReadyCount: notReadyParticipants.length,
        totalParticipants: meeting.participants.length,
      }, { status: 400 })
    }

    // 모임 상태를 PLAYING으로 변경
    await prisma.meeting.update({
      where: { id },
      data: {
        status: 'PLAYING',
        gameStartedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, status: 'PLAYING' })
  } catch (error) {
    console.error('Failed to start meeting:', error)
    return NextResponse.json(
      { message: '모임 시작에 실패했습니다' },
      { status: 500 }
    )
  }
}
