import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/ranking - 유저 랭킹 및 검색
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100)

    // 검색어가 있으면 닉네임 검색, 없으면 상위 100명
    const users = await prisma.user.findMany({
      where: search
        ? {
            nickname: {
              contains: search,
            },
          }
        : undefined,
      select: {
        id: true,
        nickname: true,
        profileImage: true,
        level: true,
        exp: true,
        meetingCount: true,
        hostCount: true,
        likeReceived: true,
        region: true,
        representativeBadge: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        representativeBadge2: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { exp: 'desc' },
        { meetingCount: 'desc' },
        { likeReceived: 'desc' },
      ],
      take: limit,
    })

    // 랭킹 정보 추가
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      score: user.exp + user.meetingCount * 10 + user.likeReceived * 5,
    }))

    return NextResponse.json(rankedUsers)
  } catch (error) {
    console.error('Failed to fetch user ranking:', error)
    return NextResponse.json(
      { message: '유저 랭킹을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
