import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { awardBadge } from '@/lib/badges'

// POST /api/badges/early-bird - 얼리버드 뱃지 획득 체크
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        hasViewedMeeting: true,
        badges: {
          include: { badge: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ message: '사용자를 찾을 수 없습니다' }, { status: 404 })
    }

    // 이미 모임을 열람한 적이 있으면 스킵
    if (user.hasViewedMeeting) {
      return NextResponse.json({ awarded: false, reason: 'already_viewed' })
    }

    // 이미 얼리버드 뱃지가 있으면 스킵
    const hasEarlyBird = user.badges.some((ub) => ub.badge.code === 'EARLY_BIRD')
    if (hasEarlyBird) {
      // 열람 플래그만 업데이트
      await prisma.user.update({
        where: { id: session.user.id },
        data: { hasViewedMeeting: true },
      })
      return NextResponse.json({ awarded: false, reason: 'already_has_badge' })
    }

    // 얼리버드 뱃지 부여
    const newBadge = await awardBadge(session.user.id, 'EARLY_BIRD')

    // 열람 플래그 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: { hasViewedMeeting: true },
    })

    if (newBadge) {
      return NextResponse.json({
        awarded: true,
        badge: {
          id: newBadge.badge.id,
          code: newBadge.badge.code,
          name: newBadge.badge.name,
          description: newBadge.badge.description,
          icon: newBadge.badge.icon,
        },
      })
    }

    return NextResponse.json({ awarded: false, reason: 'badge_not_found' })
  } catch (error) {
    console.error('Failed to check early bird badge:', error)
    return NextResponse.json(
      { message: '뱃지 확인에 실패했습니다' },
      { status: 500 }
    )
  }
}
