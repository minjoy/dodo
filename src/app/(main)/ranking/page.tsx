'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Tab = 'national' | 'myRegion' | 'nearby'
type Period = 'weekly' | 'monthly' | 'total'

interface RegionRanking {
  region: string
  rank: number
  weeklyPoints: number
  monthlyPoints: number
  totalPoints: number
  memberCount: number
  meetingCount: number
  grade: string
  gradeName: string
  prevWeeklyRank?: number
}

interface MemberRanking {
  id: string
  nickname: string
  profileImage: string | null
  level: number
  rank: number
  weeklyPoints: number
  meetingCount: number
  hostCount: number
}

interface NearbyRanking {
  region: string
  rank: number
  isMyRegion: boolean
  memberCount: number
  weeklyMeetings: number
  weeklyPoints: number
}

const GRADE_EMOJI: Record<string, string> = {
  village: '🏠',
  town: '🏘️',
  city: '🏙️',
  paradise: '🎡',
  hotplace: '🔥',
  honor: '🎖️',
  champion: '🏆',
  legend: '👑',
}

export default function RankingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('national')
  const [period, setPeriod] = useState<Period>('weekly')
  const [isLoading, setIsLoading] = useState(true)

  // 전국 랭킹 데이터
  const [nationalRankings, setNationalRankings] = useState<RegionRanking[]>([])
  const [myRegionRank, setMyRegionRank] = useState<{ rank: number; region: string } | null>(null)

  // 내 동네 데이터
  const [myRegionData, setMyRegionData] = useState<{
    stats: {
      memberCount: number
      weeklyMeetings: number
      activeMembersThisWeek: number
      weeklyPoints?: number
      grade?: string
      gradeName?: string
    }
    members: MemberRanking[]
  } | null>(null)

  // 근처 동네 데이터
  const [nearbyData, setNearbyData] = useState<{
    myRank: number
    rankings: NearbyRanking[]
  } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, activeTab, period])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'national') {
        const res = await fetch(`/api/regions/ranking?period=${period}`)
        const data = await res.json()
        setNationalRankings(data.rankings || [])
        setMyRegionRank(data.myRegion)
      } else if (activeTab === 'myRegion' && session?.user?.region) {
        const res = await fetch(`/api/regions/${encodeURIComponent(session.user.region)}`)
        const data = await res.json()
        setMyRegionData(data)
      } else if (activeTab === 'nearby') {
        const res = await fetch('/api/regions/nearby')
        const data = await res.json()
        setNearbyData(data)
      }
    } catch (error) {
      console.error('Failed to fetch ranking:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankChange = (current: number, prev?: number) => {
    if (!prev) return null
    const diff = prev - current
    if (diff > 0) return { direction: 'up', value: diff }
    if (diff < 0) return { direction: 'down', value: Math.abs(diff) }
    return { direction: 'same', value: 0 }
  }

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}`
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-primary to-primary-dark text-white sticky top-0 z-40">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🏆 동네 랭킹
          </h1>
          <p className="text-white/80 text-sm mt-1">우리 동네가 제일 잘 논다!</p>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab('national')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'national'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60'
            }`}
          >
            전국 랭킹
          </button>
          <button
            onClick={() => setActiveTab('myRegion')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'myRegion'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60'
            }`}
          >
            내 동네
          </button>
          <button
            onClick={() => setActiveTab('nearby')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'nearby'
                ? 'text-white border-b-2 border-white'
                : 'text-white/60'
            }`}
          >
            근처 동네
          </button>
        </div>
      </header>

      {/* 콘텐츠 */}
      <div className="px-4 py-4">
        {/* 전국 랭킹 */}
        {activeTab === 'national' && (
          <>
            {/* 기간 선택 */}
            <div className="flex gap-2 mb-4">
              {[
                { value: 'weekly', label: '이번 주' },
                { value: 'monthly', label: '이번 달' },
                { value: 'total', label: '전체' },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value as Period)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    period === p.value
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 내 동네 순위 카드 */}
            {myRegionRank && myRegionRank.rank > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-4 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-sm text-amber-700">내 동네 순위</p>
                      <p className="font-bold text-lg text-gray-900">
                        {myRegionRank.region}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-primary">
                      {myRegionRank.rank}위
                    </p>
                    <p className="text-xs text-gray-500">
                      / {nationalRankings.length}개 동네
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 랭킹 리스트 */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {nationalRankings.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <span className="text-4xl block mb-2">🏘️</span>
                    <p>아직 랭킹 데이터가 없습니다</p>
                    <p className="text-sm mt-1">모임에 참여하면 동네 점수가 올라가요!</p>
                  </div>
                ) : (
                  nationalRankings.map((ranking, index) => (
                    <div
                      key={ranking.region}
                      className={`flex items-center gap-3 p-4 ${
                        index !== nationalRankings.length - 1 ? 'border-b border-gray-100' : ''
                      } ${ranking.region === session?.user?.region ? 'bg-primary/5' : ''}`}
                    >
                      {/* 순위 */}
                      <div className="w-10 text-center">
                        {ranking.rank <= 3 ? (
                          <span className="text-2xl">{getRankEmoji(ranking.rank)}</span>
                        ) : (
                          <span className="text-lg font-bold text-gray-400">{ranking.rank}</span>
                        )}
                      </div>

                      {/* 등급 아이콘 */}
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xl">{GRADE_EMOJI[ranking.grade] || '🏠'}</span>
                      </div>

                      {/* 동네 정보 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{ranking.region}</span>
                          {ranking.region === session?.user?.region && (
                            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                              내 동네
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span>👥 {ranking.memberCount}명</span>
                          <span>•</span>
                          <span>{ranking.gradeName}</span>
                        </div>
                      </div>

                      {/* 점수 */}
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {period === 'weekly'
                            ? ranking.weeklyPoints
                            : period === 'monthly'
                              ? ranking.monthlyPoints
                              : ranking.totalPoints}
                          pt
                        </p>
                        <p className="text-xs text-gray-400">
                          모임 {ranking.meetingCount}회
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* 내 동네 */}
        {activeTab === 'myRegion' && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : myRegionData ? (
              <>
                {/* 동네 통계 */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                      <span className="text-xl">📍</span>
                      {session?.user?.region}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{GRADE_EMOJI[myRegionData.stats.grade || 'village'] || '🏠'}</span>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{myRegionData.stats.gradeName || '동네마을'}</p>
                        <p className="font-bold text-primary">{myRegionData.stats.weeklyPoints?.toLocaleString() || 0}pt</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {myRegionData.stats.memberCount}
                      </p>
                      <p className="text-xs text-gray-500">활동 주민</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {myRegionData.stats.weeklyMeetings}
                      </p>
                      <p className="text-xs text-gray-500">이번 주 모임</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">
                        {myRegionData.stats.activeMembersThisWeek}
                      </p>
                      <p className="text-xs text-gray-500">활동 중</p>
                    </div>
                  </div>
                </div>

                {/* 우리동네 점수를 올린 주민 */}
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🏅</span> 우리동네 점수를 올린 주민
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {myRegionData.members.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      <p>아직 활동한 주민이 없습니다</p>
                    </div>
                  ) : (
                    myRegionData.members.slice(0, 20).map((member, index) => (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 p-4 ${
                          index !== Math.min(myRegionData.members.length, 20) - 1
                            ? 'border-b border-gray-100'
                            : ''
                        } ${member.id === session?.user?.id ? 'bg-primary/5' : ''}`}
                      >
                        {/* 순위 */}
                        <div className="w-8 text-center">
                          {member.rank <= 3 ? (
                            <span className="text-xl">{getRankEmoji(member.rank)}</span>
                          ) : (
                            <span className="font-bold text-gray-400">{member.rank}</span>
                          )}
                        </div>

                        {/* 프로필 */}
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {member.profileImage ? (
                            <img
                              src={member.profileImage}
                              alt={member.nickname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* 이름 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{member.nickname}</span>
                            <span className="text-xs text-gray-400">Lv.{member.level}</span>
                            {member.id === session?.user?.id && (
                              <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded">
                                나
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            모임 {member.meetingCount}회 • 개최 {member.hostCount}회
                          </p>
                        </div>

                        {/* 점수 */}
                        <div className="text-right">
                          <p className="font-bold text-primary">{member.weeklyPoints}pt</p>
                          <p className="text-xs text-gray-400">이번 주</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <p>동네 정보를 불러올 수 없습니다</p>
              </div>
            )}
          </>
        )}

        {/* 근처 동네 */}
        {activeTab === 'nearby' && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : nearbyData ? (
              <>
                {/* 내 동네 순위 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">근처 동네 중 내 순위</p>
                      <p className="font-bold text-lg text-gray-900">{session?.user?.region}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black text-blue-600">
                        {nearbyData.myRank}위
                      </p>
                      <p className="text-xs text-gray-500">/ {nearbyData.rankings.length}개 동네</p>
                    </div>
                  </div>
                </div>

                {/* 경쟁 동네 리스트 */}
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>⚔️</span> 라이벌 동네
                </h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {nearbyData.rankings.map((ranking, index) => (
                    <div
                      key={ranking.region}
                      className={`flex items-center gap-3 p-4 ${
                        index !== nearbyData.rankings.length - 1 ? 'border-b border-gray-100' : ''
                      } ${ranking.isMyRegion ? 'bg-primary/5' : ''}`}
                    >
                      {/* 순위 */}
                      <div className="w-10 text-center">
                        {ranking.rank <= 3 ? (
                          <span className="text-2xl">{getRankEmoji(ranking.rank)}</span>
                        ) : (
                          <span className="text-lg font-bold text-gray-400">{ranking.rank}</span>
                        )}
                      </div>

                      {/* 동네 정보 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{ranking.region}</span>
                          {ranking.isMyRegion && (
                            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                              내 동네
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span>👥 {ranking.memberCount}명</span>
                          <span>•</span>
                          <span>모임 {ranking.weeklyMeetings}회</span>
                        </div>
                      </div>

                      {/* 점수 */}
                      <div className="text-right">
                        <p className="font-bold text-primary">{ranking.weeklyPoints}pt</p>
                        <p className="text-xs text-gray-400">이번 주</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 안내 */}
                <div className="mt-4 p-4 bg-gray-100 rounded-xl">
                  <p className="text-sm text-gray-600 text-center">
                    🔥 인접 동네들과 경쟁하며 우리 동네 순위를 올려보세요!
                  </p>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <p>근처 동네 정보를 불러올 수 없습니다</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 점수 안내 */}
      <div className="px-4 mt-4">
        <details className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <summary className="p-4 cursor-pointer font-medium text-gray-700 flex items-center gap-2">
            <span>💡</span> 점수는 어떻게 쌓이나요?
          </summary>
          <div className="px-4 pb-4 text-sm text-gray-600 space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <div>
                <span>모임 개최</span>
                <p className="text-xs text-gray-400">완료 + 3명 이상 참석</p>
              </div>
              <span className="font-medium text-primary">+10pt</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <div>
                <span>모임 참여</span>
                <p className="text-xs text-gray-400">실제 참석 + 평가 완료</p>
              </div>
              <span className="font-medium text-primary">+4pt</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <div>
                <span>좋은 평가 받기</span>
                <p className="text-xs text-gray-400">2회 이상 참여한 유저에게</p>
              </div>
              <span className="font-medium text-primary">+2pt</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <div>
                <span>신규 주민</span>
                <p className="text-xs text-gray-400">첫 모임 참석 완료 후</p>
              </div>
              <span className="font-medium text-primary">+2pt</span>
            </div>
            <div className="flex justify-between py-2">
              <div>
                <span>떠들기 작성</span>
                <p className="text-xs text-gray-400">모임 1회 이상 참여자</p>
              </div>
              <span className="font-medium text-primary">+1pt</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}
