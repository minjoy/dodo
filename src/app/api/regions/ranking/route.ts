import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 점수 산정 기준 (개선된 버전)
const POINTS = {
  MEETING_HOST: 10,      // 모임 개최 (완료 + 3명 이상 참석)
  MEETING_JOIN: 4,       // 모임 참여 (실제 참석 + 평가 완료)
  GOOD_REVIEW: 2,        // 좋은 평가 받음 (평가자가 2회 이상 참여 유저)
  NEW_MEMBER: 2,         // 신규 주민 (첫 모임 참석 완료 후)
  SHOUT: 1,              // 떠들기 (모임 1회 이상 참여 이력)
}

// 등급 기준 (상향 조정)
function getGrade(points: number): string {
  if (points >= 5000) return 'legend'
  if (points >= 2500) return 'paradise'
  if (points >= 1000) return 'city'
  if (points >= 300) return 'town'
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

// 동네별 통계 계산 (개선된 악용 방지 버전)
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

  // ============================================
  // 1. 모임 개최 점수 (완료 + 참석자 3명 이상)
  // ============================================
  const completedMeetings = await prisma.meeting.findMany({
    where: {
      createdAt: { gte: weekStart },
      status: 'COMPLETED',  // 완료된 모임만
    },
    select: {
      id: true,
      region: true,
      _count: {
        select: {
          participants: {
            where: { status: 'ATTENDED' }  // 실제 참석자만
          }
        }
      }
    }
  })

  // 참석자 3명 이상인 모임만 카운트 (호스트 포함)
  const validHostings = completedMeetings.filter(m => m._count.participants >= 2) // 호스트 + 2명 = 3명

  // ============================================
  // 2. 모임 참여 점수 (실제 참석 + 평가 완료)
  // ============================================
  // 실제 참석한 참여자 목록
  const attendedParticipants = await prisma.participant.findMany({
    where: {
      joinedAt: { gte: weekStart },
      status: 'ATTENDED',  // 실제 참석만
    },
    select: {
      userId: true,
      meetingId: true,
      user: { select: { region: true } },
    },
  })

  // 평가를 완료한 참여자 목록
  const reviewers = await prisma.review.findMany({
    where: {
      createdAt: { gte: weekStart },
    },
    select: {
      reviewerId: true,
      meetingId: true,
    },
  })

  // 참석 + 평가 완료한 케이스만 카운트
  const reviewerSet = new Set(reviewers.map(r => `${r.reviewerId}-${r.meetingId}`))
  const validParticipations = attendedParticipants.filter(p =>
    reviewerSet.has(`${p.userId}-${p.meetingId}`)
  )

  // ============================================
  // 3. 좋은 평가 점수 (평가자가 2회 이상 참여한 유저)
  // ============================================
  // 2회 이상 참여한 유저 목록
  const experiencedUsers = await prisma.user.findMany({
    where: {
      meetingCount: { gte: 2 },
      isBanned: false,
    },
    select: { id: true },
  })
  const experiencedUserIds = new Set(experiencedUsers.map(u => u.id))

  // 좋은 평가 중 경험있는 유저가 준 것만
  const validReviews = await prisma.review.findMany({
    where: {
      createdAt: { gte: weekStart },
      rating: { gte: 4 },
      reviewerId: { in: Array.from(experiencedUserIds) },
    },
    include: {
      reviewee: { select: { region: true } },
    },
  })

  // ============================================
  // 4. 신규 가입 점수 (첫 모임 참석 완료 후)
  // ============================================
  // 이번 주 가입 + 모임 참석 완료한 유저
  const newActiveMembers = await prisma.user.findMany({
    where: {
      createdAt: { gte: weekStart },
      region: { not: '전체' },
      meetingCount: { gte: 1 },  // 최소 1회 참여
      isBanned: false,
    },
    select: { region: true },
  })

  // ============================================
  // 5. 떠들기 점수 (모임 1회 이상 참여 이력)
  // ============================================
  const weeklyShouts = await prisma.shout.findMany({
    where: {
      createdAt: { gte: weekStart },
    },
    select: { userId: true },
  })

  // 모임 참여 이력 있는 유저만 필터
  const shoutUserIds = [...new Set(weeklyShouts.map(s => s.userId))]
  const validShoutUsers = await prisma.user.findMany({
    where: {
      id: { in: shoutUserIds },
      meetingCount: { gte: 1 },  // 1회 이상 참여
    },
    select: { id: true, region: true },
  })

  // ============================================
  // 월간 통계
  // ============================================
  const monthlyCompletedMeetings = await prisma.meeting.findMany({
    where: {
      createdAt: { gte: monthStart },
      status: 'COMPLETED',
    },
    select: {
      region: true,
      _count: {
        select: {
          participants: {
            where: { status: 'ATTENDED' }
          }
        }
      }
    }
  })
  const monthlyValidHostings = monthlyCompletedMeetings.filter(m => m._count.participants >= 2)

  // ============================================
  // 통계 집계
  // ============================================
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

  // 1. 모임 개최 점수
  const hostingByRegion = new Map<string, number>()
  validHostings.forEach(m => {
    hostingByRegion.set(m.region, (hostingByRegion.get(m.region) || 0) + 1)
  })
  hostingByRegion.forEach((count, region) => {
    const stat = statsMap.get(region)
    if (stat) {
      stat.weeklyPoints += count * POINTS.MEETING_HOST
      stat.meetingCount = count
    }
  })

  // 2. 모임 참여 점수
  const participationByRegion = new Map<string, number>()
  validParticipations.forEach(p => {
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

  // 3. 좋은 평가 점수
  const reviewByRegion = new Map<string, number>()
  validReviews.forEach(r => {
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

  // 4. 신규 가입 점수
  const newMemberByRegion = new Map<string, number>()
  newActiveMembers.forEach(u => {
    newMemberByRegion.set(u.region, (newMemberByRegion.get(u.region) || 0) + 1)
  })
  newMemberByRegion.forEach((count, region) => {
    const stat = statsMap.get(region)
    if (stat) {
      stat.weeklyPoints += count * POINTS.NEW_MEMBER
    }
  })

  // 5. 떠들기 점수
  const shoutByRegion = new Map<string, number>()
  validShoutUsers.forEach(u => {
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

  // 월간 점수
  const monthlyHostingByRegion = new Map<string, number>()
  monthlyValidHostings.forEach(m => {
    monthlyHostingByRegion.set(m.region, (monthlyHostingByRegion.get(m.region) || 0) + 1)
  })
  monthlyHostingByRegion.forEach((count, region) => {
    const stat = statsMap.get(region)
    if (stat) {
      stat.monthlyPoints += count * POINTS.MEETING_HOST
    }
  })

  // 총점 및 등급 계산
  statsMap.forEach(stat => {
    stat.totalPoints = stat.weeklyPoints + stat.monthlyPoints
    stat.grade = getGrade(stat.totalPoints)
  })

  return Array.from(statsMap.values())
}
