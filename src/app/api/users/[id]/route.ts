import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id] - 사용자 프로필 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
        bio: true,
        region: true,
        level: true,
        meetingCount: true,
        hostCount: true,
        likeReceived: true,
        createdAt: true,
        badges: {
          include: {
            badge: true,
          },
          orderBy: {
            earnedAt: 'desc',
          },
        },
        representativeBadge: true,
        representativeBadge2: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    // 별점 평균 계산
    const reviewStats = await prisma.review.aggregate({
      where: { revieweeId: id },
      _avg: { rating: true },
      _count: { rating: true },
    })

    const avgRating = reviewStats._avg.rating ? Math.round(reviewStats._avg.rating * 10) / 10 : null
    const reviewCount = reviewStats._count.rating

    return NextResponse.json({
      ...user,
      avgRating,
      reviewCount,
    })
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return NextResponse.json(
      { message: '사용자 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
