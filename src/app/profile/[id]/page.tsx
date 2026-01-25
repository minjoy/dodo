'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/common'
import { getLevelName } from '@/lib/utils'

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

interface UserProfile {
  id: string
  nickname: string
  profileImage: string | null
  bio: string | null
  region: string
  level: number
  meetingCount: number
  hostCount: number
  likeReceived: number
  createdAt: string
  badges: UserBadge[]
  representativeBadge: Badge | null
  representativeBadge2: Badge | null
}

const LEVEL_COLORS = {
  1: 'from-green-400 to-emerald-500',
  2: 'from-blue-400 to-indigo-500',
  3: 'from-purple-400 to-pink-500',
  4: 'from-orange-400 to-red-500',
  5: 'from-yellow-400 to-amber-500',
}

const LEVEL_EMOJIS = ['🌱', '👋', '⭐', '👑', '🏆']

const REPORT_REASONS = [
  { value: 'INAPPROPRIATE_BEHAVIOR', label: '부적절한 행동' },
  { value: 'NO_SHOW', label: '노쇼' },
  { value: 'HARASSMENT', label: '괴롭힘' },
  { value: 'SPAM', label: '스팸' },
  { value: 'FAKE_PROFILE', label: '허위 프로필' },
  { value: 'OTHER', label: '기타' },
]

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [isReporting, setIsReporting] = useState(false)

  const userId = params.id as string

  useEffect(() => {
    fetchProfile()
  }, [userId])

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (showReportModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showReportModal])

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else {
        router.push('/home')
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReport = async () => {
    if (!reportReason) return

    setIsReporting(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedId: userId,
          reason: reportReason,
          description: reportDescription,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('신고가 접수되었습니다')
        setShowReportModal(false)
        setReportReason('')
        setReportDescription('')
      } else {
        alert(data.message || '신고 접수에 실패했습니다')
      }
    } catch (error) {
      alert('신고 접수에 실패했습니다')
    } finally {
      setIsReporting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-gray-400 font-medium">프로필 로딩 중...</p>
      </div>
    )
  }

  if (!profile) return null

  const userLevel = (profile.level || 1) as 1 | 2 | 3 | 4 | 5
  const isMyProfile = session?.user?.id === profile.id

  // 뱃지를 카테고리별로 그룹화
  const badgesByCategory = profile.badges.reduce((acc, ub) => {
    const cat = ub.badge.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(ub)
    return acc
  }, {} as Record<string, UserBadge[]>)

  const categoryNames: Record<string, string> = {
    meeting: '모임 참여',
    host: '호스팅',
    social: '소셜',
    game: '게임',
    special: '특별',
    general: '일반',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-8">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100/50 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">프로필</h1>
          {!isMyProfile && (
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
          )}
          {isMyProfile && <div className="w-10" />}
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* 프로필 카드 */}
        <div className={`bg-gradient-to-br ${LEVEL_COLORS[userLevel]} rounded-3xl p-6 text-white shadow-xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white/20 p-1 shadow-lg">
                  <Avatar
                    src={profile.profileImage}
                    alt={profile.nickname}
                    size="xl"
                    fallback={profile.nickname}
                  />
                </div>
                {(profile.representativeBadge || profile.representativeBadge2) && (
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-xl flex items-center gap-0.5 px-1.5 py-1 shadow-lg">
                    {profile.representativeBadge && (
                      <span className="text-lg" title={profile.representativeBadge.name}>
                        {profile.representativeBadge.icon}
                      </span>
                    )}
                    {profile.representativeBadge2 && (
                      <span className="text-lg" title={profile.representativeBadge2.name}>
                        {profile.representativeBadge2.icon}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profile.nickname}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold">
                      {LEVEL_EMOJIS[userLevel - 1]} Lv.{userLevel} {getLevelName(userLevel)}
                    </span>
                  </div>
                </div>
                <p className="text-white/80 text-sm flex items-center gap-1 mt-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {profile.region}
                </p>
              </div>
            </div>

            {profile.bio && (
              <p className="text-white/90 text-sm mb-4">{profile.bio}</p>
            )}

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold">{profile.meetingCount}</p>
                <p className="text-xs text-white/80">참여</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold">{profile.hostCount}</p>
                <p className="text-xs text-white/80">개설</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
                <p className="text-2xl font-bold">{profile.likeReceived}</p>
                <p className="text-xs text-white/80">좋아요</p>
              </div>
            </div>
          </div>
        </div>

        {/* 뱃지 섹션 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏅</span>
            <h3 className="font-bold text-gray-900">획득한 뱃지</h3>
            <span className="ml-auto text-sm text-gray-500">{profile.badges.length}개</span>
          </div>

          {profile.badges.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(badgesByCategory).map(([category, badges]) => (
                <div key={category}>
                  <p className="text-xs text-gray-500 font-medium mb-2">
                    {categoryNames[category] || category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((ub) => (
                      <div
                        key={ub.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                          profile.representativeBadge?.id === ub.badge.id
                            ? 'bg-primary/10 border-2 border-primary'
                            : 'bg-gray-50'
                        }`}
                        title={ub.badge.description}
                      >
                        <span className="text-xl">{ub.badge.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{ub.badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <span className="text-4xl">🎯</span>
              <p className="mt-2">아직 획득한 뱃지가 없어요</p>
            </div>
          )}
        </div>
      </div>

      {/* 신고 모달 */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">사용자 신고</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신고 사유
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">선택하세요</option>
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 내용 (선택)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="신고 내용을 자세히 적어주세요"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason || isReporting}
                className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl disabled:bg-gray-300"
              >
                {isReporting ? '접수 중...' : '신고하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
