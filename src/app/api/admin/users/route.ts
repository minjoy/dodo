import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ADMIN_COOKIE_KEY = 'mng_auth_x7k9'
const ADMIN_PASSWORD = 'care'

// GET /api/admin/users - 관리자 사용자 목록 조회 (상세 정보 포함)
export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인 (쿠키 기반)
    const cookie = request.cookies.get(ADMIN_COOKIE_KEY)
    if (cookie?.value !== ADMIN_PASSWORD) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const filter = searchParams.get('filter') || 'all' // all, banned, active

    const where: Record<string, unknown> = {
      isDummy: false,
    }

    if (search) {
      where.OR = [
        { nickname: { contains: search } },
        { email: { contains: search } },
      ]
    }

    if (filter === 'banned') {
      where.isBanned = true
    } else if (filter === 'active') {
      where.isBanned = false
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          nickname: true,
          email: true,
          profileImage: true,
          region: true,
          level: true,
          exp: true,
          gender: true,
          birthYear: true,
          ageRange: true,
          hostCount: true,
          meetingCount: true,
          likeReceived: true,
          noShowCount: true,
          isBanned: true,
          bannedAt: true,
          bannedUntil: true,
          banReason: true,
          createdAt: true,
          _count: {
            select: {
              reportsReceived: true,
              reviewsReceived: true,
              participations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.user.count({ where }),
    ])

    // 각 사용자의 평균 평점 계산
    const usersWithRating = await Promise.all(
      users.map(async (user: { id: string } & Record<string, unknown>) => {
        const avgRating = await prisma.review.aggregate({
          where: { revieweeId: user.id },
          _avg: { rating: true },
          _count: { id: true },
        })

        return {
          ...user,
          avgRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : null,
          reviewCount: avgRating._count.id,
        }
      })
    )

    return NextResponse.json({
      users: usersWithRating,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Failed to fetch admin users:', error)
    return NextResponse.json(
      { message: '사용자 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/users - 사용자 정지/해제
export async function PATCH(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const cookie = request.cookies.get(ADMIN_COOKIE_KEY)
    if (cookie?.value !== ADMIN_PASSWORD) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, action, reason } = body
    // action: 'ban10' | 'ban30' | 'banPermanent' | 'unban'

    if (!userId || !action) {
      return NextResponse.json({ message: '필수 항목이 누락되었습니다' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    if (action === 'unban') {
      // 정지 해제
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            isBanned: false,
            bannedAt: null,
            bannedUntil: null,
            banReason: null,
          },
        }),
        // BannedKakao 테이블에서도 제거 (영구 정지 해제 시)
        prisma.bannedKakao.deleteMany({
          where: { kakaoId: user.kakaoId },
        }),
      ])
      return NextResponse.json({ message: '정지가 해제되었습니다' })
    }

    if (action === 'ban10') {
      // 10일 정지
      const bannedUntil = new Date()
      bannedUntil.setDate(bannedUntil.getDate() + 10)

      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          bannedAt: new Date(),
          bannedUntil,
          banReason: reason || '관리자에 의한 10일 정지',
        },
      })
      return NextResponse.json({ message: '10일 정지 처리되었습니다' })
    }

    if (action === 'ban30') {
      // 30일 정지
      const bannedUntil = new Date()
      bannedUntil.setDate(bannedUntil.getDate() + 30)

      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: true,
          bannedAt: new Date(),
          bannedUntil,
          banReason: reason || '관리자에 의한 30일 정지',
        },
      })
      return NextResponse.json({ message: '30일 정지 처리되었습니다' })
    }

    if (action === 'banPermanent') {
      // 영구 정지
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            isBanned: true,
            bannedAt: new Date(),
            bannedUntil: null, // null = 영구 정지
            banReason: reason || '관리자에 의한 영구 정지',
          },
        }),
        prisma.bannedKakao.upsert({
          where: { kakaoId: user.kakaoId },
          create: {
            kakaoId: user.kakaoId,
            reason: reason || '영구 정지',
            originalUserId: userId,
            originalNickname: user.nickname,
          },
          update: {
            reason: reason || '영구 정지',
          },
        }),
      ])
      return NextResponse.json({ message: '영구 정지 처리되었습니다' })
    }

    return NextResponse.json({ message: '알 수 없는 작업입니다' }, { status: 400 })
  } catch (error) {
    console.error('Failed to process user suspension:', error)
    return NextResponse.json(
      { message: '사용자 처리에 실패했습니다' },
      { status: 500 }
    )
  }
}
