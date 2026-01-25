import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isWithinRadius, READY_RADIUS_METERS } from '@/lib/location'

// POST /api/meetings/[id]/ready - 레디 상태 토글
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
    const { latitude, longitude, isReady } = body

    // 모임 조회
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: {
          where: { userId: session.user.id },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    // 호스트이거나 참가자인지 확인
    const isHost = meeting.hostId === session.user.id
    const participant = meeting.participants[0]

    if (!isHost && !participant) {
      return NextResponse.json({ message: '참가자가 아닙니다' }, { status: 403 })
    }

    // 레디하려면 위치 검증 필요
    if (isReady && latitude !== undefined && longitude !== undefined) {
      const withinRadius = isWithinRadius(
        latitude,
        longitude,
        meeting.latitude,
        meeting.longitude,
        READY_RADIUS_METERS
      )

      if (!withinRadius) {
        return NextResponse.json(
          {
            message: `모임 장소에서 ${READY_RADIUS_METERS}m 이내에 있어야 레디할 수 있습니다`,
            distance: true,
          },
          { status: 400 }
        )
      }
    }

    // 호스트는 별도 처리 (참가자 테이블에 없음)
    if (isHost) {
      // 호스트 레디 상태는 모임 상태로 관리
      // 모든 참가자가 레디하면 호스트가 시작 가능
      return NextResponse.json({
        success: true,
        isHost: true,
        message: '호스트는 모든 참가자가 레디하면 게임을 시작할 수 있습니다',
      })
    }

    // 참가자 레디 상태 업데이트
    const updatedParticipant = await prisma.participant.update({
      where: { id: participant.id },
      data: {
        isReady,
        readyAt: isReady ? new Date() : null,
        readyLat: isReady ? latitude : null,
        readyLng: isReady ? longitude : null,
      },
    })

    return NextResponse.json({
      success: true,
      isReady: updatedParticipant.isReady,
    })
  } catch (error) {
    console.error('Failed to update ready status:', error)
    return NextResponse.json(
      { message: '레디 상태 변경에 실패했습니다' },
      { status: 500 }
    )
  }
}
