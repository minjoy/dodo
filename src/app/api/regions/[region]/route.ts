import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 점수 기준
const POINTS = {
  MEETING_HOST: 10,
  MEETING_JOIN: 4,
  GOOD_REVIEW: 2,
}

// 등급 기준 (8단계)
function getGrade(points: number): string {
  if (points >= 100000) return 'legend'
  if (points >= 50000) return 'champion'
  if (points >= 20000) return 'honor'
  if (points >= 7500) return 'hotplace'
  if (points >= 2500) return 'paradise'
  if (points >= 1000) return 'city'
  if (points >= 300) return 'town'
  return 'village'
}

const GRADE_NAMES: Record<string, string> = {
  village: '동네마을',
  town: '활기찬 마을',
  city: '번화한 도시',
  paradise: '놀이 천국',
  hotplace: '핫플레이스',
  honor: '명예의 동네',
  champion: '챔피언 동네',
  legend: '전설의 동네',
}

// 특정 동네 상세 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ region: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { region } = await params
    const decodedRegion = decodeURIComponent(region)

    // 이번 주 시작일 (월요일)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)

    // 동네 주민들 조회 (활동 점수 기준 정렬)
    const members = await prisma.user.findMany({
      where: {
        region: decodedRegion,
        isBanned: false,
      },
      select: {
        id: true,
        nickname: true,
        profileImage: true,
        level: true,
        meetingCount: true,
        hostCount: true,
        likeReceived: true,
        createdAt: true,
        representativeBadge: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { meetingCount: 'desc' },
        { hostCount: 'desc' },
        { likeReceived: 'desc' },
      ],
      take: 50,
    })

    // 주민별 이번 주 활동 점수 계산
    const memberIds = members.map((m: typeof members[number]) => m.id)

    // 이번 주 모임 개최
    const weeklyHostings = await prisma.meeting.groupBy({
      by: ['hostId'],
      where: {
        hostId: { in: memberIds },
        createdAt: { gte: weekStart },
        status: { not: 'CANCELLED' },
      },
      _count: { id: true },
    })

    // 이번 주 모임 참여
    const weeklyParticipations = await prisma.participant.groupBy({
      by: ['userId'],
      where: {
        userId: { in: memberIds },
        joinedAt: { gte: weekStart },
        status: { in: ['CONFIRMED', 'ATTENDED'] },
      },
      _count: { id: true },
    })

    // 이번 주 좋은 평가
    const weeklyGoodReviews = await prisma.review.groupBy({
      by: ['revieweeId'],
      where: {
        revieweeId: { in: memberIds },
        createdAt: { gte: weekStart },
        rating: { gte: 4 },
      },
      _count: { id: true },
    })

    // 점수 계산
    const hostingMap = new Map<string, number>(weeklyHostings.map((h: typeof weeklyHostings[number]) => [h.hostId, h._count.id]))
    const participationMap = new Map<string, number>(weeklyParticipations.map((p: typeof weeklyParticipations[number]) => [p.userId, p._count.id]))
    const reviewMap = new Map<string, number>(weeklyGoodReviews.map((r: typeof weeklyGoodReviews[number]) => [r.revieweeId, r._count.id]))

    const rankedMembers = members.map((member: typeof members[number]) => {
      const hostCount: number = hostingMap.get(member.id) || 0
      const participationCount: number = participationMap.get(member.id) || 0
      const goodReviewCount: number = reviewMap.get(member.id) || 0

      const weeklyPoints: number =
        hostCount * POINTS.MEETING_HOST +
        participationCount * POINTS.MEETING_JOIN +
        goodReviewCount * POINTS.GOOD_REVIEW

      return {
        ...member,
        weeklyPoints,
        weeklyHostCount: hostCount,
        weeklyParticipationCount: participationCount,
      }
    }).sort((a: { weeklyPoints: number }, b: { weeklyPoints: number }) => b.weeklyPoints - a.weeklyPoints)

    // 동네 총 주간 점수 계산
    const regionWeeklyPoints = rankedMembers.reduce((sum: number, m: { weeklyPoints: number }) => sum + m.weeklyPoints, 0)
    const regionGrade = getGrade(regionWeeklyPoints)
    const regionGradeName = GRADE_NAMES[regionGrade]

    // 동네 통계
    const totalMembers = await prisma.user.count({
      where: { region: decodedRegion, isBanned: false },
    })

    const weeklyMeetings = await prisma.meeting.count({
      where: {
        region: decodedRegion,
        createdAt: { gte: weekStart },
        status: { not: 'CANCELLED' },
      },
    })

    // 최근 모임들
    const recentMeetings = await prisma.meeting.findMany({
      where: {
        region: decodedRegion,
        status: { in: ['COMPLETED', 'RECRUITING', 'CLOSED'] },
      },
      select: {
        id: true,
        title: true,
        meetingDate: true,
        status: true,
        maxParticipants: true,
        _count: {
          select: {
            participants: {
              where: { status: { in: ['CONFIRMED', 'ATTENDED'] } },
            },
          },
        },
      },
      orderBy: { meetingDate: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      region: decodedRegion,
      stats: {
        memberCount: totalMembers,
        weeklyMeetings,
        activeMembersThisWeek: rankedMembers.filter((m: { weeklyPoints: number }) => m.weeklyPoints > 0).length,
        weeklyPoints: regionWeeklyPoints,
        grade: regionGrade,
        gradeName: regionGradeName,
      },
      members: rankedMembers.map((m: typeof rankedMembers[number], i: number) => ({ ...m, rank: i + 1 })),
      recentMeetings: recentMeetings.map((m: typeof recentMeetings[number]) => ({
        ...m,
        participantCount: m._count.participants,
      })),
    })
  } catch (error) {
    console.error('Region detail error:', error)
    return NextResponse.json({ error: '동네 정보 조회 실패' }, { status: 500 })
  }
}
