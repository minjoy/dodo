import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/meetings/[id]/kick - 참여자 강퇴
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
    const body = await request.json()
    const { userId: targetUserId } = body

    if (!targetUserId) {
      return NextResponse.json({ message: '강퇴할 사용자를 지정해주세요' }, { status: 400 })
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: {
          where: { userId: targetUserId, status: { not: 'CANCELLED' } },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    // 호스트만 강퇴 가능
    if (meeting.hostId !== session.user.id) {
      return NextResponse.json({ message: '호스트만 참여자를 강퇴할 수 있습니다' }, { status: 403 })
    }

    // 호스트 자신은 강퇴 불가
    if (targetUserId === session.user.id) {
      return NextResponse.json({ message: '자기 자신은 강퇴할 수 없습니다' }, { status: 400 })
    }

    // 이미 시작된 모임은 강퇴 불가
    if (meeting.status === 'PLAYING' || meeting.status === 'COMPLETED') {
      return NextResponse.json({ message: '이미 시작되었거나 완료된 모임에서는 강퇴할 수 없습니다' }, { status: 400 })
    }

    // 참가자 확인
    const participant = meeting.participants[0]
    if (!participant) {
      return NextResponse.json({ message: '해당 참가자를 찾을 수 없습니다' }, { status: 404 })
    }

    // 참가자 상태를 CANCELLED로 변경
    await prisma.participant.update({
      where: { id: participant.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({ success: true, message: '참가자가 강퇴되었습니다' })
  } catch (error) {
    console.error('Failed to kick participant:', error)
    return NextResponse.json(
      { message: '강퇴에 실패했습니다' },
      { status: 500 }
    )
  }
}
