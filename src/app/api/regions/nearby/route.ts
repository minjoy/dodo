import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 인접 동네 매핑 (서울 기준 간단한 매핑)
const NEARBY_REGIONS: Record<string, string[]> = {
  '성수동': ['건대', '왕십리', '서울숲', '잠실'],
  '홍대': ['합정', '신촌', '연남동', '망원동'],
  '강남': ['압구정', '선릉', '신사', '역삼'],
  '신촌': ['홍대', '이대', '연희동'],
  '이태원': ['한남동', '용산', '녹사평'],
  '건대': ['성수동', '왕십리', '자양동'],
  '잠실': ['성수동', '송파', '천호'],
  '여의도': ['영등포', '당산', '마포'],
  '망원동': ['합정', '홍대', '연남동', '상암'],
  '연남동': ['홍대', '합정', '망원동'],
  '합정': ['홍대', '망원동', '상수'],
  '서울숲': ['성수동', '왕십리', '압구정'],
  '압구정': ['강남', '청담', '서울숲', '신사'],
  '선릉': ['강남', '역삼', '삼성'],
  '신림': ['봉천', '서울대입구', '낙성대'],
  '왕십리': ['성수동', '건대', '행당'],
}

// 모든 지역 리스트
const ALL_REGIONS = [
  '성수동', '홍대', '강남', '신촌', '이태원', '건대', '잠실',
  '여의도', '망원동', '연남동', '합정', '서울숲', '압구정', '선릉', '신림', '왕십리'
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
    }

    const myRegion = session.user.region

    // 내 동네의 인접 동네 찾기
    let nearbyRegions = NEARBY_REGIONS[myRegion] || []

    // 인접 동네가 없으면 랜덤하게 5개 추천
    if (nearbyRegions.length === 0) {
      nearbyRegions = ALL_REGIONS
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
