import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateShareCode } from '@/lib/nickname'
import { checkAndAwardBadges } from '@/lib/badges'

// GET /api/meetings - 모임 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const status = searchParams.get('status')
    const gameType = searchParams.get('gameType')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const includeCompleted = searchParams.get('includeCompleted') === 'true'

    const where: Record<string, unknown> = {}
    const excludeRegion = searchParams.get('excludeRegion')

    if (region) {
      where.region = region
    }
    // 특정 지역 제외 (다른 동네 모임 조회용)
    if (excludeRegion) {
      where.region = { not: excludeRegion }
    }
    if (status) {
      where.status = status
    }
    if (gameType) {
      where.gameType = gameType
    }

    // includeCompleted가 true가 아닌 경우에만 오늘 이후의 모임으로 필터링
    if (!includeCompleted) {
      where.meetingDate = {
        gte: new Date(),
      }
    }

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            level: true,
            meetingCount: true,
            likeReceived: true,
          },
        },
        _count: {
          select: {
            participants: {
              where: {
                status: {
                  not: 'CANCELLED',
                },
              },
            },
          },
        },
      },
      orderBy: {
        meetingDate: includeCompleted ? 'desc' : 'asc',
      },
      take: limit,
      skip: offset,
    })

    return NextResponse.json(meetings)
  } catch (error) {
    console.error('Failed to fetch meetings:', error)
    return NextResponse.json(
      { message: '모임 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/meetings - 모임 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      gameType,
      meetingDate,
      duration,
      region,
      placeName,
      address,
      latitude,
      longitude,
      maxParticipants,
      minLevel,
      password,
    } = body

    // 유효성 검사
    if (!title || title.length < 2) {
      return NextResponse.json(
        { message: '제목은 2자 이상 입력해주세요' },
        { status: 400 }
      )
    }

    if (!meetingDate || new Date(meetingDate) < new Date()) {
      return NextResponse.json(
        { message: '모임 날짜는 오늘 이후여야 합니다' },
        { status: 400 }
      )
    }

    if (!placeName) {
      return NextResponse.json(
        { message: '장소를 입력해주세요' },
        { status: 400 }
      )
    }

    if (maxParticipants < 2 || maxParticipants > 20) {
      return NextResponse.json(
        { message: '모집 인원은 2~20명 사이여야 합니다' },
        { status: 400 }
      )
    }

    // 고유한 공유 코드 생성
    let shareCode = generateShareCode()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.meeting.findUnique({ where: { shareCode } })
      if (!existing) break
      shareCode = generateShareCode()
      attempts++
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        gameType: gameType || 'GYEONGDO',
        meetingDate: new Date(meetingDate),
        duration: duration || 120,
        region,
        placeName,
        address: address || placeName,
        latitude: latitude || 37.5665,
        longitude: longitude || 126.978,
        maxParticipants,
        minLevel: minLevel || 1,
        hostId: session.user.id,
        shareCode,
        password: password || null,
      },
      include: {
        host: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            level: true,
          },
        },
      },
    })

    // 호스트 hostCount 증가
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hostCount: { increment: 1 } },
    })

    // 호스트 뱃지 체크 (비동기로 실행)
    checkAndAwardBadges(session.user.id).catch((error) =>
      console.error('Failed to check badges:', error)
    )

    return NextResponse.json(meeting, { status: 201 })
  } catch (error) {
    console.error('Failed to create meeting:', error)
    return NextResponse.json(
      { message: '모임 생성에 실패했습니다' },
      { status: 500 }
    )
  }
}
