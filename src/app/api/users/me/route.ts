import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateNickname } from '@/lib/nickname'

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

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { message: '사용자 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// PATCH /api/users/me - 부분 수정 (대표 뱃지 등)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { representativeBadgeIds } = body // 배열로 받음 (최대 1개)

    // 대표 뱃지 설정 (최대 1개)
    if (representativeBadgeIds !== undefined) {
      const badgeIds = Array.isArray(representativeBadgeIds) ? representativeBadgeIds : []

      if (badgeIds.length > 1) {
        return NextResponse.json({ message: '대표 뱃지는 1개만 선택 가능합니다' }, { status: 400 })
      }

      // 소유 여부 확인
      for (const badgeId of badgeIds.filter(Boolean)) {
        const userBadge = await prisma.userBadge.findFirst({
          where: {
            userId: session.user.id,
            badgeId: badgeId,
          },
        })
        if (!userBadge) {
          return NextResponse.json({ message: '소유하지 않은 뱃지입니다' }, { status: 400 })
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          representativeBadgeId: badgeIds[0] || null,
          representativeBadge2Id: null, // 두 번째 뱃지는 항상 null (1개만 가능)
        },
        include: {
          representativeBadge: true,
          representativeBadge2: true,
        },
      })

      return NextResponse.json(updatedUser)
    }

    return NextResponse.json({ message: '수정할 항목이 없습니다' }, { status: 400 })
  } catch (error) {
    console.error('Failed to patch user:', error)
    return NextResponse.json(
      { message: '사용자 정보 수정에 실패했습니다' },
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
    const { nickname, bio, region, regionCode, profileImage, representativeBadgeId } = body

    // 닉네임 유효성 검사
    if (nickname) {
      const validation = validateNickname(nickname)
      if (!validation.isValid) {
        return NextResponse.json({ message: validation.error }, { status: 400 })
      }

      // 중복 검사 (본인 제외)
      const existing = await prisma.user.findFirst({
        where: {
          nickname: nickname.trim(),
          NOT: { id: session.user.id }
        }
      })
      if (existing) {
        return NextResponse.json({ message: '이미 사용 중인 닉네임입니다' }, { status: 400 })
      }
    }

    // 대표 뱃지 설정 시 본인 소유 뱃지인지 확인
    if (representativeBadgeId) {
      const userBadge = await prisma.userBadge.findFirst({
        where: {
          userId: session.user.id,
          badgeId: representativeBadgeId,
        },
      })
      if (!userBadge) {
        return NextResponse.json({ message: '소유하지 않은 뱃지입니다' }, { status: 400 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(nickname && { nickname: nickname.trim() }),
        ...(bio !== undefined && { bio }),
        ...(region && { region }),
        ...(regionCode && { regionCode }),
        ...(profileImage && { profileImage }),
        ...(representativeBadgeId !== undefined && { representativeBadgeId }),
      },
      include: {
        representativeBadge: true,
        representativeBadge2: true,
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
