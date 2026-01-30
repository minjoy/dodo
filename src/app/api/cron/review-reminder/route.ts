import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { webpush } from '@/lib/webpush'
import { errorLogger } from '@/lib/error-logger'

// GET /api/cron/review-reminder
// 모임 종료 1시간 후 호출 - 평가를 완료하지 않은 사용자에게 푸시 발송
// 매 시간마다 호출하여 1시간 전에 종료된 모임 체크
export async function GET(request: NextRequest) {
  // 간단한 인증 (cron에서 호출 시 사용)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1시간 전 ~ 2시간 전 사이에 종료된 모임 조회 (1시간 단위로 호출 가정)
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

    // 최근 종료된 모임 조회
    const completedMeetings = await prisma.meeting.findMany({
      where: {
        status: 'COMPLETED',
        gameEndedAt: {
          gte: twoHoursAgo,
          lt: oneHourAgo,
        },
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                pushSubscriptions: true,
              },
            },
          },
        },
      },
    })

    let sent = 0
    let failed = 0
    let expiredRemoved = 0
    const usersNotified = new Set<string>()

    for (const meeting of completedMeetings) {
      const participantUserIds = meeting.participants.map((p: { userId: string }) => p.userId)

      // 이 모임에서 각 참여자가 평가한 리뷰 조회
      const reviews = await prisma.review.findMany({
        where: {
          meetingId: meeting.id,
        },
        select: {
          reviewerId: true,
          revieweeId: true,
        },
      })

      // 각 참여자별로 평가해야 할 대상 수와 평가 완료 수 계산
      for (const participant of meeting.participants) {
        const userId = participant.userId
        const otherParticipants = participantUserIds.filter((id: string) => id !== userId)

        // 내가 이 모임에서 작성한 리뷰 수
        const myReviewCount = reviews.filter((r: { reviewerId: string }) => r.reviewerId === userId).length

        // 아직 평가할 사람이 남아있다면 푸시 발송
        if (myReviewCount < otherParticipants.length) {
          const user = participant.user
          if (user.pushSubscriptions.length === 0) continue

          const remainingCount = otherParticipants.length - myReviewCount
          const payload = JSON.stringify({
            title: '함께한 멤버를 평가해주세요!',
            body: `"${meeting.title}" 모임에서 ${remainingCount}명의 평가가 남아있어요.`,
            url: `/meeting/${meeting.id}/review`,
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
              usersNotified.add(userId)
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
      }
    }

    return NextResponse.json({
      message: 'Review reminder sent',
      meetingsChecked: completedMeetings.length,
      usersNotified: usersNotified.size,
      sent,
      failed,
      expiredRemoved,
    })
  } catch (error) {
    errorLogger.capture('Cron/reviewReminder', error)
    return NextResponse.json(
      { message: '푸시 발송 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
