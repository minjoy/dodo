import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 점수 산정 기준
const POINTS = {
  MEETING_HOST: 50,      // 모임 개최
  MEETING_JOIN: 20,      // 모임 참여
  MEETING_COMPLETE: 30,  // 모임 완료 (평가까지)
  SHOUT: 5,              // 떠들기 작성
  NEW_MEMBER: 10,        // 신규 주민 가입
  GOOD_REVIEW: 10,       // 좋은 평가 받음 (4점 이상)
}

// 등급 기준
function getGrade(points: number): string {
  if (points >= 5000) return 'legend'
  if (points >= 3000) return 'paradise'
  if (points >= 1500) return 'city'
  if (points >= 500) return 'town'
  return 'village'
}

// 등급 한글명
const GRADE_NAMES: Record<string, string> = {
  village: '동네마을',
  town: '활기찬 마을',
  city: '번화한 도시',
  paradise: '놀이 천국',
  legend: '전설의 동네',
}

// 동네 랭킹 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'weekly' // weekly, monthly, total
    const limit = parseInt(searchParams.get('limit') || '50')

    // 이번 주 시작일 (월요일)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)

    // 이번 달 시작일
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // 실시간으로 동네별 통계 계산
    const regionStats = await calculateRegionStats(weekStart, monthStart)

    // 순위 정렬
    const sortField = period === 'monthly' ? 'monthlyPoints' : period === 'total' ? 'totalPoints' : 'weeklyPoints'
    const sortedStats = regionStats.sort((a, b) => b[sortField] - a[sortField])

    // 순위 부여
    const rankedStats = sortedStats.map((stat, index) => ({
      ...stat,
      rank: index + 1,
      gradeName: GRADE_NAMES[stat.grade] || '동네마을',
    }))

    // 내 동네 찾기
    const myRegion = session.user.region
    const myRank = rankedStats.findIndex(s => s.region === myRegion) + 1

    return NextResponse.json({
      rankings: rankedStats.slice(0, limit),
      myRegion: {
        region: myRegion,
        rank: myRank || null,
        stats: rankedStats.find(s => s.region === myRegion) || null,
      },
      total: rankedStats.length,
      period,
    })
  } catch (error) {
    console.error('Region ranking error:', error)
    return NextResponse.json({ error: '랭킹 조회 실패' }, { status: 500 })
  }
}

// 동네별 통계 계산
async function calculateRegionStats(weekStart: Date, monthStart: Date) {
  // 지역별 주민 수
  const memberCounts = await prisma.user.groupBy({
    by: ['region'],
    where: {
      region: { not: '전체' },
      isBanned: false,
    },
    _count: { id: true },
  })

  // 이번 주 모임 개최 (호스트)
  const weeklyHostings = await prisma.meeting.groupBy({
    by: ['region'],
    where: {
      createdAt: { gte: weekStart },
      status: { not: 'CANCELLED' },
    },
    _count: { id: true },
  })

  // 이번 주 모임 참여
  const weeklyParticipations = await prisma.participant.findMany({
    where: {
      joinedAt: { gte: weekStart },
      status: { in: ['CONFIRMED', 'ATTENDED'] },
    },
    include: {
      user: { select: { region: true } },
    },
  })

  // 이번 주 완료된 모임 평가
  const weeklyReviews = await prisma.review.findMany({
    where: {
      createdAt: { gte: weekStart },
      rating: { gte: 4 },
    },
    include: {
      reviewee: { select: { region: true } },
    },
  })

  // 이번 주 떠들기
  const weeklyShouts = await prisma.shout.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: weekStart },
    },
    _count: { id: true },
  })
  const shoutUserIds = weeklyShouts.map(s => s.userId)
  const shoutUsers = await prisma.user.findMany({
    where: { id: { in: shoutUserIds } },
    select: { id: true, region: true },
  })

  // 이번 주 신규 가입
  const newMembers = await prisma.user.groupBy({
    by: ['region'],
    where: {
      createdAt: { gte: weekStart },
      region: { not: '전체' },
    },
    _count: { id: true },
  })

  // 이번 달 통계도 비슷하게 계산
  const monthlyHostings = await prisma.meeting.groupBy({
    by: ['region'],
    where: {
      createdAt: { gte: monthStart },
      status: { not: 'CANCELLED' },
    },
    _count: { id: true },
  })

  // 통계 집계
  const statsMap = new Map<string, {
    region: string
    weeklyPoints: number
    monthlyPoints: number
    totalPoints: number
    memberCount: number
    meetingCount: number
    grade: string
  }>()

  // 주민 수 초기화
  memberCounts.forEach(m => {
    statsMap.set(m.region, {
      region: m.region,
      weeklyPoints: 0,
      monthlyPoints: 0,
      totalPoints: 0,
      memberCount: m._count.id,
      meetingCount: 0,
      grade: 'village',
    })
  })

  // 모임 개최 점수
  weeklyHostings.forEach(h => {
    const stat = statsMap.get(h.region)
    if (stat) {
      stat.weeklyPoints += h._count.id * POINTS.MEETING_HOST
      stat.meetingCount = h._count.id
    }
  })

  // 모임 참여 점수
  const participationByRegion = new Map<string, number>()
  weeklyParticipations.forEach(p => {
    const region = p.user.region
    if (region && region !== '전체') {
      participationByRegion.set(region, (participationByRegion.get(region) || 0) + 1)
    }
  })
  participationByRegion.forEach((count, region) => {
    const stat = statsMap.get(region)
    if (stat) {
      stat.weeklyPoints += count * POINTS.MEETING_JOIN
    }
  })

  // 좋은 평가 점수
  const reviewByRegion = new Map<string, number>()
  weeklyReviews.forEach(r => {
    const region = r.reviewee.region
    if (region && region !== '전체') {
      reviewByRegion.set(region, (reviewByRegion.get(region) || 0) + 1)
    }
  })
  reviewByRegion.forEach((count, region) => {
    const stat = statsMap.get(region)
    if (stat) {
      stat.weeklyPoints += count * POINTS.GOOD_REVIEW
    }
  })

  // 떠들기 점수
  const shoutByRegion = new Map<string, number>()
  shoutUsers.forEach(u => {
    if (u.region && u.region !== '전체') {
      shoutByRegion.set(u.region, (shoutByRegion.get(u.region) || 0) + 1)
    }
  })
  shoutByRegion.forEach((count, region) => {
    const stat = statsMap.get(region)
    if (stat) {
      stat.weeklyPoints += count * POINTS.SHOUT
    }
  })

  // 신규 가입 점수
  newMembers.forEach(n => {
    const stat = statsMap.get(n.region)
    if (stat) {
      stat.weeklyPoints += n._count.id * POINTS.NEW_MEMBER
    }
  })

  // 월간 점수 (간단히 모임 개최 기준)
  monthlyHostings.forEach(h => {
    const stat = statsMap.get(h.region)
    if (stat) {
      stat.monthlyPoints += h._count.id * POINTS.MEETING_HOST
    }
  })

  // 총점 = 주간 + 월간 (추후 히스토리 기반으로 개선 가능)
  statsMap.forEach(stat => {
    stat.totalPoints = stat.weeklyPoints + stat.monthlyPoints
    stat.grade = getGrade(stat.totalPoints)
  })

  return Array.from(statsMap.values())
}
