import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 전체 사용자 수
    const totalUsers = await prisma.user.count()

    // 오늘 가입한 사용자 수
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayUsers = await prisma.user.count({
      where: {
        createdAt: { gte: today },
      },
    })

    // 이번 주 가입한 사용자 수
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekUsers = await prisma.user.count({
      where: {
        createdAt: { gte: weekAgo },
      },
    })

    // 전체 모임 수
    const totalMeetings = await prisma.meeting.count()

    // 상태별 모임 수
    const meetingsByStatus = await prisma.meeting.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    // 오늘 생성된 모임 수
    const todayMeetings = await prisma.meeting.count({
      where: {
        createdAt: { gte: today },
      },
    })

    // 이번 주 생성된 모임 수
    const weekMeetings = await prisma.meeting.count({
      where: {
        createdAt: { gte: weekAgo },
      },
    })

    // 전체 참여 기록 수
    const totalParticipations = await prisma.participant.count({
      where: {
        status: { not: 'CANCELLED' },
      },
    })

    // 전체 리뷰 수
    const totalReviews = await prisma.review.count()

    // 평균 평점
    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true },
    })

    // 레벨별 사용자 분포
    const usersByLevel = await prisma.user.groupBy({
      by: ['level'],
      _count: { id: true },
      orderBy: { level: 'asc' },
    })

    // 연령대별 사용자 분포
    const usersByAgeRange = await prisma.user.groupBy({
      by: ['ageRange'],
      _count: { id: true },
    })

    // 게임 타입별 모임 수
    const meetingsByGameType = await prisma.meeting.groupBy({
      by: ['gameType'],
      _count: { id: true },
    })

    // 성별별 사용자 분포
    const usersByGender = await prisma.user.groupBy({
      by: ['gender'],
      _count: { id: true },
    })

    // 최근 가입 사용자 10명
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nickname: true,
        region: true,
        level: true,
        exp: true,
        ageRange: true,
        gender: true,
        birthYear: true,
        email: true,
        createdAt: true,
      },
    })

    // 최근 모임 10개
    const recentMeetings = await prisma.meeting.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        gameType: true,
        status: true,
        meetingDate: true,
        maxParticipants: true,
        host: {
          select: {
            nickname: true,
          },
        },
        _count: {
          select: { participants: true },
        },
        createdAt: true,
      },
    })

    // 일별 가입자 수 (최근 7일)
    const dailySignups = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })

      dailySignups.push({
        date: date.toISOString().split('T')[0],
        count,
      })
    }

    // 일별 모임 생성 수 (최근 7일)
    const dailyMeetings = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await prisma.meeting.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      })

      dailyMeetings.push({
        date: date.toISOString().split('T')[0],
        count,
      })
    }

    // 좋아요 총 횟수
    const totalLikes = await prisma.review.count({
      where: { isLike: true },
    })

    return NextResponse.json({
      users: {
        total: totalUsers,
        today: todayUsers,
        thisWeek: weekUsers,
        byLevel: usersByLevel,
        byAgeRange: usersByAgeRange,
        byGender: usersByGender,
        recent: recentUsers,
        dailySignups,
      },
      meetings: {
        total: totalMeetings,
        today: todayMeetings,
        thisWeek: weekMeetings,
        byStatus: meetingsByStatus,
        byGameType: meetingsByGameType,
        recent: recentMeetings,
        dailyMeetings,
      },
      participations: {
        total: totalParticipations,
      },
      reviews: {
        total: totalReviews,
        avgRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : 0,
        totalLikes,
      },
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json(
      { message: '통계 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
