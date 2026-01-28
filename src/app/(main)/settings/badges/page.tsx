'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon: string
  category: string
}

interface UserBadge {
  id: string
  earnedAt: string
  badge: Badge
}

const BADGE_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'meeting', label: '모임' },
  { key: 'host', label: '호스팅' },
  { key: 'social', label: '소셜' },
  { key: 'game', label: '게임' },
  { key: 'special', label: '특별' },
]

const BADGE_TIPS: Record<string, string> = {
  FIRST_MEETING: '첫 모임에 참여하면 바로 획득!',
  MEETING_5: '꾸준히 참여하면 금방이에요',
  MEETING_10: '열정적인 플레이어의 증표',
  MEETING_30: '진정한 경도 마니아',
  MEETING_50: '전설이 되어보세요',
  FIRST_HOST: '모임을 직접 만들어보세요',
  HOST_5: '호스팅의 재미를 느껴보세요',
  HOST_10: '최고의 호스트를 향해',
  HOST_20: '경도 커뮤니티의 리더',
  LIKE_10: '좋은 매너로 시작해요',
  LIKE_30: '인기의 비결은 친절함',
  LIKE_50: '모두가 함께하고 싶어하는 사람',
  GYEONGDO_MASTER: '경찰과 도둑의 달인',
  SULRAE_MASTER: '술래잡기 전문가',
  MUGUNGHWA_MASTER: '무궁화 꽃이 피었습니다!',
  EARLY_BIRD: '초기 멤버만의 특별한 뱃지',
  PERFECT_ATTENDANCE: '신뢰의 상징',
}

export default function BadgesPage() {
  const router = useRouter()
  const [badges, setBadges] = useState<Badge[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [badgesRes, userRes] = await Promise.all([
        fetchWithAuth('/api/badges'),
        fetchWithAuth('/api/users/me'),
      ])

      if (badgesRes.ok) {
        const badgesData = await badgesRes.json()
        setBadges(badgesData)
      }

      if (userRes.ok) {
        const userData = await userRes.json()
        setUserBadges(userData.badges || [])
      }
    } catch (error) {
      console.error('Failed to fetch badges:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const earnedBadgeIds = userBadges.map((ub) => ub.badge.id)

  const filteredBadges = badges.filter(
    (badge) => selectedCategory === 'all' || badge.category === selectedCategory
  )

  const earnedCount = badges.filter((b) => earnedBadgeIds.includes(b.id)).length
  const totalCount = badges.length
  const progressPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-8">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100/50 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">뱃지 컬렉션</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* 진행 상황 */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm font-medium">수집한 뱃지</p>
              <p className="text-3xl font-bold">{earnedCount} / {totalCount}</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">🏆</span>
            </div>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-white/80 text-sm mt-2">
            {earnedCount === totalCount
              ? '축하해요! 모든 뱃지를 수집했어요! 🎉'
              : `${totalCount - earnedCount}개의 뱃지가 당신을 기다리고 있어요`}
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {BADGE_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 뱃지 목록 */}
        <div className="space-y-3">
          {filteredBadges.map((badge) => {
            const isEarned = earnedBadgeIds.includes(badge.id)
            const earnedBadge = userBadges.find((ub) => ub.badge.id === badge.id)
            const tip = BADGE_TIPS[badge.code]

            return (
              <div
                key={badge.id}
                className={`bg-white rounded-2xl p-4 border transition-all ${
                  isEarned
                    ? 'border-amber-200 shadow-sm'
                    : 'border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isEarned
                        ? 'bg-gradient-to-br from-amber-100 to-orange-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <span className={`text-3xl ${!isEarned && 'grayscale'}`}>
                      {badge.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{badge.name}</h3>
                      {isEarned && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          획득
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                    {tip && (
                      <p className={`text-xs mt-2 ${isEarned ? 'text-amber-600' : 'text-gray-400'}`}>
                        💡 {tip}
                      </p>
                    )}
                    {isEarned && earnedBadge && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(earnedBadge.earnedAt).toLocaleDateString('ko-KR')} 획득
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl">🔍</span>
            <p className="mt-2">해당 카테고리의 뱃지가 없어요</p>
          </div>
        )}
      </div>
    </div>
  )
}
