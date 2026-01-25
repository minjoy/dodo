import { prisma } from './prisma'

// 뱃지 획득 조건 체크 및 부여
export async function checkAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: {
        include: { badge: true },
      },
      participations: {
        where: { status: 'ATTENDED' },
        include: {
          meeting: true,
        },
      },
    },
  })

  if (!user) return []

  const earnedBadgeCodes = user.badges.map((ub: { badge: { code: string } }) => ub.badge.code)
  const newBadges: string[] = []

  // 참여 횟수 기반 뱃지
  const meetingCount = user.meetingCount
  if (meetingCount >= 1 && !earnedBadgeCodes.includes('FIRST_MEETING')) {
    newBadges.push('FIRST_MEETING')
  }
  if (meetingCount >= 5 && !earnedBadgeCodes.includes('MEETING_5')) {
    newBadges.push('MEETING_5')
  }
  if (meetingCount >= 10 && !earnedBadgeCodes.includes('MEETING_10')) {
    newBadges.push('MEETING_10')
  }
  if (meetingCount >= 30 && !earnedBadgeCodes.includes('MEETING_30')) {
    newBadges.push('MEETING_30')
  }
  if (meetingCount >= 50 && !earnedBadgeCodes.includes('MEETING_50')) {
    newBadges.push('MEETING_50')
  }

  // 호스트 횟수 기반 뱃지
  const hostCount = user.hostCount
  if (hostCount >= 1 && !earnedBadgeCodes.includes('FIRST_HOST')) {
    newBadges.push('FIRST_HOST')
  }
  if (hostCount >= 5 && !earnedBadgeCodes.includes('HOST_5')) {
    newBadges.push('HOST_5')
  }
  if (hostCount >= 10 && !earnedBadgeCodes.includes('HOST_10')) {
    newBadges.push('HOST_10')
  }
  if (hostCount >= 20 && !earnedBadgeCodes.includes('HOST_20')) {
    newBadges.push('HOST_20')
  }

  // 좋아요 기반 뱃지
  const likeCount = user.likeReceived
  if (likeCount >= 10 && !earnedBadgeCodes.includes('LIKE_10')) {
    newBadges.push('LIKE_10')
  }
  if (likeCount >= 30 && !earnedBadgeCodes.includes('LIKE_30')) {
    newBadges.push('LIKE_30')
  }
  if (likeCount >= 50 && !earnedBadgeCodes.includes('LIKE_50')) {
    newBadges.push('LIKE_50')
  }

  // 게임 종류별 뱃지
  const gameTypeCounts: Record<string, number> = {}
  user.participations.forEach((p: { meeting: { gameType: string } }) => {
    const gameType = p.meeting.gameType
    gameTypeCounts[gameType] = (gameTypeCounts[gameType] || 0) + 1
  })

  if ((gameTypeCounts['GYEONGDO'] || 0) >= 10 && !earnedBadgeCodes.includes('GYEONGDO_MASTER')) {
    newBadges.push('GYEONGDO_MASTER')
  }
  if ((gameTypeCounts['SULRAE'] || 0) >= 10 && !earnedBadgeCodes.includes('SULRAE_MASTER')) {
    newBadges.push('SULRAE_MASTER')
  }
  if ((gameTypeCounts['MUGUNGHWA'] || 0) >= 10 && !earnedBadgeCodes.includes('MUGUNGHWA_MASTER')) {
    newBadges.push('MUGUNGHWA_MASTER')
  }

  // 개근왕 뱃지
  if (meetingCount >= 10 && user.noShowCount === 0 && !earnedBadgeCodes.includes('PERFECT_ATTENDANCE')) {
    newBadges.push('PERFECT_ATTENDANCE')
  }

  // 새 뱃지 부여
  if (newBadges.length > 0) {
    const badges = await prisma.badge.findMany({
      where: { code: { in: newBadges } },
    })

    await prisma.userBadge.createMany({
      data: badges.map((badge: { id: string }) => ({
        userId,
        badgeId: badge.id,
      })),
      skipDuplicates: true,
    })
  }

  return newBadges
}

// 특정 뱃지 부여 (예: EARLY_BIRD)
export async function awardBadge(userId: string, badgeCode: string) {
  const badge = await prisma.badge.findUnique({
    where: { code: badgeCode },
  })

  if (!badge) return null

  const existing = await prisma.userBadge.findUnique({
    where: {
      userId_badgeId: {
        userId,
        badgeId: badge.id,
      },
    },
  })

  if (existing) return null

  return prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id,
    },
    include: { badge: true },
  })
}
