import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/push/subscribe - 푸시 구독 저장
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ message: '잘못된 구독 정보입니다' }, { status: 400 })
    }

    // 기존 구독이 있으면 업데이트, 없으면 생성
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: session.user.id,
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: '푸시 알림이 활성화되었습니다' })
  } catch (error) {
    console.error('Failed to save push subscription:', error)
    return NextResponse.json(
      { message: '푸시 구독 저장에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/push/subscribe - 푸시 구독 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ message: '잘못된 요청입니다' }, { status: 400 })
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: '푸시 알림이 비활성화되었습니다' })
  } catch (error) {
    console.error('Failed to delete push subscription:', error)
    return NextResponse.json(
      { message: '푸시 구독 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
