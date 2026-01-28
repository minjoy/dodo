import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/utils'

// 출쳌 가능 최대 거리 (미터)
const MAX_READY_DISTANCE = 500

// POST /api/meetings/[id]/ready - 출쳌하기
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
    const body = await request.json().catch(() => ({}))
    const { latitude, longitude } = body

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: {
          where: { userId: session.user.id, status: { not: 'CANCELLED' } },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    // 호스트이거나 참가자여야 함
    const isHost = meeting.hostId === session.user.id
    const participant = meeting.participants[0]

    if (!isHost && !participant) {
      return NextResponse.json({ message: '모임 참가자만 출쳌할 수 있습니다' }, { status: 403 })
    }

    // 이미 시작된 모임은 출쳌 불가
    if (meeting.status === 'PLAYING' || meeting.status === 'COMPLETED') {
      return NextResponse.json({ message: '이미 시작되었거나 완료된 모임입니다' }, { status: 400 })
    }

    // 모임 시작 1시간 전부터 출쳌 가능
    const now = new Date()
    const meetingDate = new Date(meeting.meetingDate)
    const oneHourBefore = new Date(meetingDate.getTime() - 60 * 60 * 1000)

    if (now < oneHourBefore) {
      return NextResponse.json({
        message: '모임 시작 1시간 전부터 출쳌할 수 있습니다',
        canReadyAt: oneHourBefore.toISOString(),
      }, { status: 400 })
    }

    // 위치 정보 필수 확인
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({
        message: '위치 정보가 필요합니다. 위치 권한을 허용해주세요.',
      }, { status: 400 })
    }

    // 약속 장소와의 거리 계산
    const distance = calculateDistance(
      latitude,
      longitude,
      meeting.latitude,
      meeting.longitude
    )

    // 500m 이내에서만 출쳌 가능
    if (distance > MAX_READY_DISTANCE) {
      return NextResponse.json({
        message: `약속 장소에서 ${MAX_READY_DISTANCE}m 이내에서만 출쳌할 수 있습니다`,
        distance: Math.round(distance),
        maxDistance: MAX_READY_DISTANCE,
      }, { status: 400 })
    }

    // 모임 상태가 RECRUITING이면 READY 상태로 변경
    if (meeting.status === 'RECRUITING' || meeting.status === 'CLOSED') {
      await prisma.meeting.update({
        where: { id },
        data: { status: 'READY' },
      })
    }

    if (participant) {
      // 참가자 출쳌 상태 업데이트
      await prisma.participant.update({
        where: { id: participant.id },
        data: {
          isReady: true,
          readyAt: new Date(),
          readyLat: latitude,
          readyLng: longitude,
        },
      })
    } else if (isHost) {
      // 호스트도 참가자 레코드로 관리
      const existingHostParticipant = await prisma.participant.findUnique({
        where: { meetingId_userId: { meetingId: id, userId: session.user.id } },
      })

      if (!existingHostParticipant) {
        await prisma.participant.create({
          data: {
            meetingId: id,
            userId: session.user.id,
            status: 'CONFIRMED',
            isReady: true,
            readyAt: new Date(),
            readyLat: latitude,
            readyLng: longitude,
          },
        })
      } else {
        await prisma.participant.update({
          where: { meetingId_userId: { meetingId: id, userId: session.user.id } },
          data: {
            isReady: true,
            readyAt: new Date(),
            readyLat: latitude,
            readyLng: longitude,
          },
        })
      }
    }

    return NextResponse.json({ success: true, isReady: true, distance: Math.round(distance) })
  } catch (error) {
    console.error('Failed to ready:', error)
    return NextResponse.json(
      { message: '출쳌에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/meetings/[id]/ready - 출쳌 취소
export async function DELETE(
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
          where: { userId: session.user.id, status: { not: 'CANCELLED' } },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    // 이미 시작된 모임은 출쳌 취소 불가
    if (meeting.status === 'PLAYING') {
      return NextResponse.json({ message: '이미 시작된 모임입니다' }, { status: 400 })
    }

    const participant = meeting.participants[0]

    if (participant) {
      await prisma.participant.update({
        where: { id: participant.id },
        data: {
          isReady: false,
          readyAt: null,
          readyLat: null,
          readyLng: null,
        },
      })
    } else {
      // 호스트의 참가자 레코드가 있으면 업데이트
      await prisma.participant.updateMany({
        where: { meetingId: id, userId: session.user.id },
        data: {
          isReady: false,
          readyAt: null,
          readyLat: null,
          readyLng: null,
        },
      })
    }

    return NextResponse.json({ success: true, isReady: false })
  } catch (error) {
    console.error('Failed to cancel ready:', error)
    return NextResponse.json(
      { message: '출쳌 취소에 실패했습니다' },
      { status: 500 }
    )
  }
}
