import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/me - 내 정보 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
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

// PUT /api/users/me - 내 정보 수정
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { nickname, bio, region, regionCode, profileImage } = body

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(nickname && { nickname }),
        ...(bio !== undefined && { bio }),
        ...(region && { region }),
        ...(regionCode && { regionCode }),
        ...(profileImage && { profileImage }),
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { message: '사용자 정보 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}
