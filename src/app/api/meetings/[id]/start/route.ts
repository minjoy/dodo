import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isWithinRadius, READY_RADIUS_METERS } from '@/lib/location'

// POST /api/meetings/[id]/start - 게임 시작
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
    const { latitude, longitude, policeCount, thiefCount, roles } = body

    // 모임 조회
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: {
          where: { status: { not: 'CANCELLED' } },
          include: { user: true },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    // 호스트만 시작 가능
    if (meeting.hostId !== session.user.id) {
      return NextResponse.json({ message: '호스트만 게임을 시작할 수 있습니다' }, { status: 403 })
    }

    // 이미 진행 중이면 안됨
    if (meeting.status === 'PLAYING') {
      return NextResponse.json({ message: '이미 게임이 진행 중입니다' }, { status: 400 })
    }

    // 호스트 위치 검증
    if (latitude !== undefined && longitude !== undefined) {
      const withinRadius = isWithinRadius(
        latitude,
        longitude,
        meeting.latitude,
        meeting.longitude,
        READY_RADIUS_METERS
      )

      if (!withinRadius) {
        return NextResponse.json(
          { message: `모임 장소에서 ${READY_RADIUS_METERS}m 이내에 있어야 시작할 수 있습니다` },
          { status: 400 }
        )
      }
    }

    // 모든 참가자 + 호스트 = 전체 인원
    const allPlayerIds = [meeting.hostId, ...meeting.participants.map((p) => p.userId)]
    const totalPlayers = allPlayerIds.length

    // 역할 배정
    let assignedRoles: { [userId: string]: 'POLICE' | 'THIEF' } = {}

    if (roles) {
      // 수동 배정된 경우
      assignedRoles = roles
    } else {
      // 자동 랜덤 배정
      const finalPoliceCount = policeCount || Math.floor(totalPlayers / 3) || 1
      const finalThiefCount = thiefCount || (totalPlayers - finalPoliceCount)

      if (finalPoliceCount + finalThiefCount !== totalPlayers) {
        return NextResponse.json(
          { message: '경찰과 도둑의 합이 전체 인원과 일치해야 합니다' },
          { status: 400 }
        )
      }

      // 셔플하고 역할 배정
      const shuffled = [...allPlayerIds].sort(() => Math.random() - 0.5)
      shuffled.forEach((userId, index) => {
        assignedRoles[userId] = index < finalPoliceCount ? 'POLICE' : 'THIEF'
      })
    }

    // 트랜잭션으로 게임 시작 처리
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      // 모임 상태 업데이트
      await tx.meeting.update({
        where: { id },
        data: {
          status: 'PLAYING',
          gameStartedAt: new Date(),
          policeCount: Object.values(assignedRoles).filter((r) => r === 'POLICE').length,
          thiefCount: Object.values(assignedRoles).filter((r) => r === 'THIEF').length,
        },
      })

      // 기존 역할 삭제 (재시작 대비)
      await tx.gameRole.deleteMany({
        where: { meetingId: id },
      })

      // 역할 생성
      await tx.gameRole.createMany({
        data: Object.entries(assignedRoles).map(([userId, role]) => ({
          meetingId: id,
          userId,
          role,
        })),
      })
    })

    // 역할 정보 조회
    const gameRoles = await prisma.gameRole.findMany({
      where: { meetingId: id },
      include: {
        user: {
          select: { id: true, nickname: true, profileImage: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      gameStartedAt: new Date(),
      roles: gameRoles,
    })
  } catch (error) {
    console.error('Failed to start game:', error)
    return NextResponse.json(
      { message: '게임 시작에 실패했습니다' },
      { status: 500 }
    )
  }
}
