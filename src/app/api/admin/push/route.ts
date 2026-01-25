import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { webpush } from '@/lib/webpush'

// POST /api/admin/push - 모든 사용자에게 푸시 발송
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, url } = body

    if (!title || !message) {
      return NextResponse.json({ message: '제목과 메시지가 필요합니다' }, { status: 400 })
    }

    // 모든 푸시 구독 가져오기
    const subscriptions = await prisma.pushSubscription.findMany()

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: '구독자가 없습니다', sent: 0 })
    }

    const payload = JSON.stringify({
      title,
      body: message,
      url: url || '/home',
    })

    let successCount = 0
    let failCount = 0
    const failedEndpoints: string[] = []

    // 각 구독에 푸시 발송
    await Promise.all(
      subscriptions.map(async (sub: { endpoint: string; p256dh: string; auth: string }) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          )
          successCount++
        } catch (error: unknown) {
          failCount++
          // 만료된 구독은 삭제
          if (error && typeof error === 'object' && 'statusCode' in error) {
            const statusCode = (error as { statusCode: number }).statusCode
            if (statusCode === 404 || statusCode === 410) {
              failedEndpoints.push(sub.endpoint)
            }
          }
        }
      })
    )

    // 만료된 구독 삭제
    if (failedEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: {
          endpoint: { in: failedEndpoints },
        },
      })
    }

    return NextResponse.json({
      message: `푸시 발송 완료`,
      sent: successCount,
      failed: failCount,
      expiredRemoved: failedEndpoints.length,
    })
  } catch (error) {
    console.error('Failed to send push notifications:', error)
    return NextResponse.json(
      { message: '푸시 발송에 실패했습니다' },
      { status: 500 }
    )
  }
}

// GET /api/admin/push - 푸시 구독 통계
export async function GET() {
  try {
    const totalSubscriptions = await prisma.pushSubscription.count()
    const uniqueUsers = await prisma.pushSubscription.groupBy({
      by: ['userId'],
    })

    return NextResponse.json({
      totalSubscriptions,
      uniqueUsers: uniqueUsers.length,
    })
  } catch (error) {
    console.error('Failed to get push stats:', error)
    return NextResponse.json(
      { message: '통계 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
