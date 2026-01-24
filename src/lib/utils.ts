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

export function getLevelName(level: number): string {
  const levels: Record<number, string> = {
    1: '새싹',
    2: '동네친구',
    3: '단골멤버',
    4: '동네대장',
    5: '전설',
  }
  return levels[level] || '새싹'
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
    FULL: '모집완료',
    ONGOING: '진행중',
    COMPLETED: '완료',
    CANCELLED: '취소됨',
  }
  return statuses[status] || '알 수 없음'
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    RECRUITING: 'bg-green-100 text-green-800',
    FULL: 'bg-orange-100 text-orange-800',
    ONGOING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function calculateExp(meetingCount: number, hostCount: number, likeReceived: number): number {
  return meetingCount * 10 + hostCount * 20 + likeReceived * 5
}

export function calculateLevel(exp: number): number {
  if (exp >= 500) return 5
  if (exp >= 200) return 4
  if (exp >= 100) return 3
  if (exp >= 30) return 2
  return 1
}
