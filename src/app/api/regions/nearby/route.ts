import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getNearbyRegions, getAllRegionNames } from '@/data/regions'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const myRegion = session.user.region

    // 내 동네의 인접 동네 찾기
    let nearbyRegions = getNearbyRegions(myRegion)

    // 인접 동네가 없으면 랜덤하게 5개 추천
    if (nearbyRegions.length === 0) {
      nearbyRegions = getAllRegionNames()
        .filter(r => r !== myRegion)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
    }

    // 내 동네 + 인접 동네들의 통계
    const regionsToCompare = [myRegion, ...nearbyRegions]

    // 이번 주 시작일 (월요일)
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)

    // 각 동네별 통계
    const stats = await Promise.all(
      regionsToCompare.map(async (region) => {
        const memberCount = await prisma.user.count({
          where: { region, isBanned: false },
        })

        const weeklyMeetings = await prisma.meeting.count({
          where: {
            region,
            createdAt: { gte: weekStart },
            status: { not: 'CANCELLED' },
          },
        })

        const weeklyParticipations = await prisma.participant.count({
          where: {
            joinedAt: { gte: weekStart },
            status: { in: ['CONFIRMED', 'ATTENDED'] },
            user: { region },
          },
        })

        const weeklyPoints = weeklyMeetings * 50 + weeklyParticipations * 20

        return {
          region,
          isMyRegion: region === myRegion,
          memberCount,
          weeklyMeetings,
          weeklyParticipations,
          weeklyPoints,
        }
      })
    )

    // 점수순 정렬
    const sortedStats = stats.sort((a, b) => b.weeklyPoints - a.weeklyPoints)
    const rankedStats = sortedStats.map((stat, index) => ({
      ...stat,
      rank: index + 1,
    }))

    // 내 동네 순위
    const myRank = rankedStats.find(s => s.isMyRegion)?.rank || 0

    return NextResponse.json({
      myRegion,
      myRank,
      nearbyCount: nearbyRegions.length,
      rankings: rankedStats,
    })
  } catch (error) {
    console.error('Nearby regions error:', error)
    return NextResponse.json({ error: '인접 동네 조회 실패' }, { status: 500 })
  }
}
