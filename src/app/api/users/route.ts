import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id] - 사용자 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: '사용자 ID가 필요합니다' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
        bio: true,
        region: true,
        level: true,
        exp: true,
        meetingCount: true,
        hostCount: true,
        likeReceived: true,
        createdAt: true,
        badges: {
          include: {
            badge: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { message: '사용자 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
