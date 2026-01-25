import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { webpush } from '@/lib/webpush'

// GET /api/cron/daily-meeting-reminder
// 매일 오전 10시에 호출 - 오늘 모임이 있는 사용자에게 푸시 발송
export async function GET(request: NextRequest) {
  // 간단한 인증 (cron에서 호출 시 사용)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'gyeongdo-cron-secret'

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 오늘 예정된 모임에 참여 중인 사용자들 조회
    const participants = await prisma.participant.findMany({
      where: {
        meeting: {
          meetingDate: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            in: ['RECRUITING', 'CONFIRMED'],
          },
        },
      },
      include: {
        user: {
          include: {
            pushSubscriptions: true,
          },
        },
        meeting: true,
      },
    })

    // 사용자별로 그룹화 (한 사용자가 여러 모임에 참여할 수 있음)
    const userMeetings = new Map<string, { user: typeof participants[0]['user'], meetings: typeof participants[0]['meeting'][] }>()

    for (const p of participants) {
      const existing = userMeetings.get(p.userId)
      if (existing) {
        existing.meetings.push(p.meeting)
      } else {
        userMeetings.set(p.userId, { user: p.user, meetings: [p.meeting] })
      }
    }

    let sent = 0
    let failed = 0
    let expiredRemoved = 0

    // 각 사용자에게 푸시 발송
    for (const [userId, { user, meetings }] of userMeetings) {
      if (user.pushSubscriptions.length === 0) continue

      const meetingCount = meetings.length
      const firstMeeting = meetings[0]
      const meetingTime = new Date(firstMeeting.meetingDate).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      })

      const title = meetingCount > 1
        ? `오늘 모임이 ${meetingCount}개 있어요!`
        : '오늘 모임이 있어요!'

      const body = meetingCount > 1
        ? `"${firstMeeting.title}" 외 ${meetingCount - 1}개의 모임이 오늘 진행됩니다.`
        : `"${firstMeeting.title}" - ${meetingTime}`

      const payload = JSON.stringify({
        title,
        body,
        url: meetingCount > 1 ? '/my' : `/meeting/${firstMeeting.id}`,
      })

      for (const sub of user.pushSubscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          )
          sent++
        } catch (error: unknown) {
          const webPushError = error as { statusCode?: number }
          if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
            // 구독이 만료됨 - 삭제
            await prisma.pushSubscription.delete({ where: { id: sub.id } })
            expiredRemoved++
          } else {
            failed++
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Daily meeting reminder sent',
      usersNotified: userMeetings.size,
      sent,
      failed,
      expiredRemoved,
    })
  } catch (error) {
    console.error('Failed to send daily meeting reminder:', error)
    return NextResponse.json(
      { message: '푸시 발송 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
