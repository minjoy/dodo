import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return `${formatDate(d)} ${formatTime(d)}`
}

export function getRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '오늘'
  if (days === 1) return '내일'
  if (days === 2) return '모레'
  if (days > 0 && days <= 7) return `${days}일 후`
  return formatDate(d)
}

// 레벨 시스템 - 온라인 게임 참고 (지수적 성장 곡선)
// 레벨 1: 0 exp (시작)
// 레벨 2: 30 exp (첫 게임 2~3회)
// 레벨 3: 80 exp (게임 5~6회)
// 레벨 4: 180 exp (게임 12~15회)
// 레벨 5: 350 exp (게임 25회+, 호스팅 경험)
// 레벨 6: 600 exp (꾸준한 활동 필요)
// 레벨 7: 1000 exp (활발한 커뮤니티 멤버)
// 레벨 8: 1600 exp (베테랑)
// 레벨 9: 2500 exp (마스터)
// 레벨 10: 4000 exp (전설)

export const LEVEL_EXP_TABLE = [
  0,     // 레벨 1
  30,    // 레벨 2
  80,    // 레벨 3
  180,   // 레벨 4
  350,   // 레벨 5
  600,   // 레벨 6
  1000,  // 레벨 7
  1600,  // 레벨 8
  2500,  // 레벨 9
  4000,  // 레벨 10 (MAX)
]

export const LEVEL_NAMES: Record<number, string> = {
  1: '새싹',
  2: '동네친구',
  3: '단골멤버',
  4: '인싸',
  5: '동네대장',
  6: '베테랑',
  7: '마스터',
  8: '그랜드마스터',
  9: '챔피언',
  10: '전설',
}

export const LEVEL_EMOJIS: Record<number, string> = {
  1: '🌱',
  2: '👋',
  3: '⭐',
  4: '🌟',
  5: '👑',
  6: '💎',
  7: '🔥',
  8: '⚡',
  9: '🏆',
  10: '🌈',
}

export const LEVEL_COLORS: Record<number, string> = {
  1: 'from-green-400 to-green-500',
  2: 'from-blue-400 to-blue-500',
  3: 'from-purple-400 to-purple-500',
  4: 'from-pink-400 to-pink-500',
  5: 'from-yellow-400 to-orange-500',
  6: 'from-cyan-400 to-blue-500',
  7: 'from-orange-500 to-red-500',
  8: 'from-purple-500 to-pink-500',
  9: 'from-yellow-500 to-amber-600',
  10: 'from-rainbow-start to-rainbow-end',
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] || '새싹'
}

export function getLevelEmoji(level: number): string {
  return LEVEL_EMOJIS[Math.min(level, 10)] || '🌱'
}

export function getLevelColor(level: number): string {
  return LEVEL_COLORS[Math.min(level, 10)] || LEVEL_COLORS[1]
}

export function getGameTypeName(gameType: string): string {
  const types: Record<string, string> = {
    GYEONGDO: '경찰과 도둑',
    SULRAE: '술래잡기',
    MUGUNGHWA: '무궁화 꽃이 피었습니다',
    PIGU: '피구',
    OTHER: '기타',
  }
  return types[gameType] || '기타'
}

export function getGameTypeEmoji(gameType: string): string {
  const emojis: Record<string, string> = {
    GYEONGDO: '🚔',
    SULRAE: '🏃',
    MUGUNGHWA: '🌺',
    PIGU: '🏐',
    OTHER: '🎮',
  }
  return emojis[gameType] || '🎮'
}

export function getStatusName(status: string): string {
  const statuses: Record<string, string> = {
    RECRUITING: '모집중',
    CLOSED: '모집마감',
    READY: '레디 대기',
    PLAYING: '게임 중',
    COMPLETED: '완료',
    CANCELLED: '취소됨',
  }
  return statuses[status] || '알 수 없음'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    RECRUITING: 'bg-green-100 text-green-800',
    CLOSED: 'bg-orange-100 text-orange-800',
    READY: 'bg-yellow-100 text-yellow-800',
    PLAYING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// 경험치 획득량
export const EXP_REWARDS = {
  GAME_PARTICIPATION: 15,  // 게임 참여
  HOST_GAME: 25,           // 게임 호스팅
  RECEIVE_LIKE: 5,         // 좋아요 받기
  GIVE_REVIEW: 3,          // 리뷰 작성
  FIRST_GAME_OF_DAY: 10,   // 하루 첫 게임 보너스
  STREAK_BONUS: 5,         // 연속 출석 보너스 (하루당)
}

export function calculateExp(meetingCount: number, hostCount: number, likeReceived: number): number {
  return meetingCount * EXP_REWARDS.GAME_PARTICIPATION +
         hostCount * EXP_REWARDS.HOST_GAME +
         likeReceived * EXP_REWARDS.RECEIVE_LIKE
}

export function calculateLevel(exp: number): number {
  for (let level = LEVEL_EXP_TABLE.length; level >= 1; level--) {
    if (exp >= LEVEL_EXP_TABLE[level - 1]) {
      return level
    }
  }
  return 1
}

// 다음 레벨까지 필요한 경험치
export function getExpToNextLevel(exp: number): { current: number; required: number; percentage: number } {
  const currentLevel = calculateLevel(exp)

  if (currentLevel >= 10) {
    return { current: exp, required: exp, percentage: 100 }
  }

  const currentLevelExp = LEVEL_EXP_TABLE[currentLevel - 1]
  const nextLevelExp = LEVEL_EXP_TABLE[currentLevel]
  const expInCurrentLevel = exp - currentLevelExp
  const expNeededForNext = nextLevelExp - currentLevelExp
  const percentage = Math.round((expInCurrentLevel / expNeededForNext) * 100)

  return {
    current: expInCurrentLevel,
    required: expNeededForNext,
    percentage: Math.min(percentage, 100),
  }
}

// 레벨업 여부 확인 (경험치 변화 전후 비교)
export function checkLevelUp(prevExp: number, newExp: number): { leveledUp: boolean; newLevel: number } {
  const prevLevel = calculateLevel(prevExp)
  const newLevel = calculateLevel(newExp)

  return {
    leveledUp: newLevel > prevLevel,
    newLevel,
  }
}
