import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/me/badges - 내 뱃지 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const userBadges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    })

    return NextResponse.json(userBadges)
  } catch (error) {
    console.error('Failed to fetch user badges:', error)
    return NextResponse.json(
      { message: '뱃지 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
