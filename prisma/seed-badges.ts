import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 뱃지 정의
const BADGES = [
  // 모임 참여 관련
  {
    code: 'FIRST_MEETING',
    name: '첫 발걸음',
    description: '첫 모임에 참여했어요',
    icon: '👣',
    category: 'meeting',
  },
  {
    code: 'MEETING_5',
    name: '단골 플레이어',
    description: '모임 5회 참여',
    icon: '🎮',
    category: 'meeting',
  },
  {
    code: 'MEETING_10',
    name: '열정 플레이어',
    description: '모임 10회 참여',
    icon: '🔥',
    category: 'meeting',
  },
  {
    code: 'MEETING_30',
    name: '베테랑',
    description: '모임 30회 참여',
    icon: '🏅',
    category: 'meeting',
  },
  {
    code: 'MEETING_50',
    name: '레전드',
    description: '모임 50회 참여',
    icon: '🏆',
    category: 'meeting',
  },

  // 호스트 관련
  {
    code: 'FIRST_HOST',
    name: '첫 호스팅',
    description: '첫 모임을 개설했어요',
    icon: '🎯',
    category: 'host',
  },
  {
    code: 'HOST_5',
    name: '인기 호스트',
    description: '모임 5회 개설',
    icon: '⭐',
    category: 'host',
  },
  {
    code: 'HOST_10',
    name: '슈퍼 호스트',
    description: '모임 10회 개설',
    icon: '🌟',
    category: 'host',
  },
  {
    code: 'HOST_20',
    name: '마스터 호스트',
    description: '모임 20회 개설',
    icon: '👑',
    category: 'host',
  },

  // 좋아요 관련
  {
    code: 'LIKE_10',
    name: '인기인',
    description: '좋아요 10개 달성',
    icon: '💕',
    category: 'social',
  },
  {
    code: 'LIKE_30',
    name: '매력쟁이',
    description: '좋아요 30개 달성',
    icon: '💖',
    category: 'social',
  },
  {
    code: 'LIKE_50',
    name: '인플루언서',
    description: '좋아요 50개 달성',
    icon: '💝',
    category: 'social',
  },

  // 게임 종류별
  {
    code: 'GYEONGDO_MASTER',
    name: '경도 마스터',
    description: '경찰과 도둑 10회 참여',
    icon: '🚔',
    category: 'game',
  },
  {
    code: 'SULRAE_MASTER',
    name: '술래 마스터',
    description: '술래잡기 10회 참여',
    icon: '🏃',
    category: 'game',
  },
  {
    code: 'MUGUNGHWA_MASTER',
    name: '무궁화 마스터',
    description: '무궁화 꽃이 피었습니다 10회 참여',
    icon: '🌺',
    category: 'game',
  },

  // 특별 뱃지
  {
    code: 'EARLY_BIRD',
    name: '얼리버드',
    description: '서비스 초기 가입자',
    icon: '🐤',
    category: 'special',
  },
  {
    code: 'PERFECT_ATTENDANCE',
    name: '개근왕',
    description: '노쇼 0회로 10회 이상 참여',
    icon: '✨',
    category: 'special',
  },
]

async function main() {
  console.log('Seeding badges...')

  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { code: badge.code },
      update: badge,
      create: badge,
    })
    console.log(`  Created/Updated badge: ${badge.name}`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
