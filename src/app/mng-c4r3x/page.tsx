'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

interface Stats {
  users: {
    total: number
    today: number
    thisWeek: number
    byLevel: { level: number; _count: { id: number } }[]
    byAgeRange: { ageRange: string | null; _count: { id: number } }[]
    byGender: { gender: string | null; _count: { id: number } }[]
    recent: {
      id: string
      nickname: string
      region: string
      level: number
      exp: number
      ageRange: string | null
      gender: string | null
      birthYear: string | null
      email: string | null
      createdAt: string
    }[]
    dailySignups: { date: string; count: number }[]
  }
  meetings: {
    total: number
    today: number
    thisWeek: number
    byStatus: { status: string; _count: { id: number } }[]
    byGameType: { gameType: string; _count: { id: number } }[]
    recent: {
      id: string
      title: string
      gameType: string
      status: string
      meetingDate: string
      maxParticipants: number
      host: { nickname: string }
      _count: { participants: number }
      createdAt: string
    }[]
    dailyMeetings: { date: string; count: number }[]
  }
  participations: {
    total: number
  }
  reviews: {
    total: number
    avgRating: number
    totalLikes: number
  }
}

interface PushStats {
  totalSubscriptions: number
  uniqueUsers: number
}

interface AdminUser {
  id: string
  nickname: string
  email: string | null
  profileImage: string | null
  region: string
  level: number
  exp: number
  gender: string | null
  birthYear: string | null
  ageRange: string | null
  hostCount: number
  meetingCount: number
  likeReceived: number
  noShowCount: number
  isBanned: boolean
  bannedAt: string | null
  bannedUntil: string | null
  banReason: string | null
  createdAt: string
  avgRating: number | null
  reviewCount: number
  _count: {
    reportsReceived: number
    reviewsReceived: number
    participations: number
  }
}

interface AdminUsersResponse {
  users: AdminUser[]
  total: number
  page: number
  totalPages: number
}

const ADMIN_COOKIE_KEY = 'mng_auth_x7k9'
const ADMIN_PASSWORD = 'care'

const STATUS_LABELS: Record<string, string> = {
  RECRUITING: '모집중',
  CLOSED: '모집마감',
  PLAYING: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소',
}

const GAME_TYPE_LABELS: Record<string, string> = {
  GYEONGDO: '경찰과 도둑',
  SULRAE: '술래잡기',
  MUGUNGHWA: '무궁화',
  PIGU: '피구',
  OTHER: '기타',
}

const GENDER_LABELS: Record<string, string> = {
  male: '남성',
  female: '여성',
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'meetings' | 'push'>('overview')
  const [pushStats, setPushStats] = useState<PushStats | null>(null)
  const [pushTitle, setPushTitle] = useState('')
  const [pushMessage, setPushMessage] = useState('')
  const [pushUrl, setPushUrl] = useState('/home')
  const [isSendingPush, setIsSendingPush] = useState(false)
  const [pushResult, setPushResult] = useState<string | null>(null)

  // 사용자 관리 상태
  const [adminUsers, setAdminUsers] = useState<AdminUsersResponse | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [userFilter, setUserFilter] = useState<'all' | 'banned' | 'active'>('all')
  const [userPage, setUserPage] = useState(1)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [suspendReason, setSuspendReason] = useState('')
  const [isSuspending, setIsSuspending] = useState(false)
  const [suspendResult, setSuspendResult] = useState<string | null>(null)

  useEffect(() => {
    const savedAuth = Cookies.get(ADMIN_COOKIE_KEY)
    if (savedAuth === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      fetchStats()
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      Cookies.set(ADMIN_COOKIE_KEY, password, { expires: 7 })
      setIsAuthenticated(true)
      setError('')
      fetchStats()
    } else {
      setError('비밀번호가 올바르지 않습니다')
    }
  }

  const handleLogout = () => {
    Cookies.remove(ADMIN_COOKIE_KEY)
    setIsAuthenticated(false)
    setStats(null)
  }

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
      // 푸시 통계도 함께 가져오기
      fetchPushStats()
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPushStats = async () => {
    try {
      const res = await fetch('/api/admin/push')
      if (res.ok) {
        const data = await res.json()
        setPushStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch push stats:', error)
    }
  }

  const fetchAdminUsers = async (page = 1, search = userSearch, filter = userFilter) => {
    setIsLoadingUsers(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        filter,
      })
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAdminUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch admin users:', error)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setUserPage(1)
    fetchAdminUsers(1, userSearch, userFilter)
  }

  const handleUserFilterChange = (filter: 'all' | 'banned' | 'active') => {
    setUserFilter(filter)
    setUserPage(1)
    fetchAdminUsers(1, userSearch, filter)
  }

  const handleUserPageChange = (page: number) => {
    setUserPage(page)
    fetchAdminUsers(page)
  }

  const handleSuspendAction = async (action: string) => {
    if (!selectedUser) return
    setIsSuspending(true)
    setSuspendResult(null)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          action,
          reason: suspendReason || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setSuspendResult(data.message)
        // 목록 새로고침
        fetchAdminUsers(userPage)
        // 2초 후 모달 닫기
        setTimeout(() => {
          setShowSuspendModal(false)
          setSelectedUser(null)
          setSuspendReason('')
          setSuspendResult(null)
        }, 1500)
      } else {
        setSuspendResult(data.message || '처리에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to suspend user:', error)
      setSuspendResult('처리 중 오류가 발생했습니다')
    } finally {
      setIsSuspending(false)
    }
  }

  // 사용자 탭 활성화 시 데이터 로드
  useEffect(() => {
    if (activeTab === 'users' && isAuthenticated && !adminUsers) {
      fetchAdminUsers()
    }
  }, [activeTab, isAuthenticated])

  const formatBanStatus = (user: AdminUser) => {
    if (!user.isBanned) return null
    if (!user.bannedUntil) return '영구 정지'
    const until = new Date(user.bannedUntil)
    if (until <= new Date()) return '정지 만료'
    const diffMs = until.getTime() - new Date().getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return `${diffDays}일 남음`
  }

  const sendPush = async () => {
    if (!pushTitle || !pushMessage) {
      setPushResult('제목과 메시지를 입력해주세요')
      return
    }

    setIsSendingPush(true)
    setPushResult(null)

    try {
      const res = await fetch('/api/admin/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pushTitle,
          message: pushMessage,
          url: pushUrl,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setPushResult(`발송 완료! 성공: ${data.sent}건, 실패: ${data.failed}건, 만료제거: ${data.expiredRemoved}건`)
        setPushTitle('')
        setPushMessage('')
        fetchPushStats()
      } else {
        setPushResult(data.message || '발송 실패')
      }
    } catch (error) {
      console.error('Failed to send push:', error)
      setPushResult('푸시 발송 중 오류가 발생했습니다')
    } finally {
      setIsSendingPush(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-white mb-6 text-center">관리자 인증</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            확인
          </button>
        </form>
      </div>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">통계 로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">경도 관리자</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/mng-c4r3x/regions'}
              className="px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-600/30 transition-colors"
            >
              동네 관리
            </button>
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition-colors"
            >
              새로고침
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 탭 */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6">
          {[
            { key: 'overview', label: '개요' },
            { key: 'users', label: '사용자' },
            { key: 'meetings', label: '모임' },
            { key: 'push', label: '푸시' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 개요 탭 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 주요 지표 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="전체 사용자" value={stats.users.total} />
              <StatCard title="전체 모임" value={stats.meetings.total} />
              <StatCard title="총 참여" value={stats.participations.total} />
              <StatCard title="총 리뷰" value={stats.reviews.total} />
            </div>

            {/* 오늘/이번주 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="오늘 가입" value={stats.users.today} color="green" />
              <StatCard title="이번주 가입" value={stats.users.thisWeek} color="green" />
              <StatCard title="오늘 모임" value={stats.meetings.today} color="blue" />
              <StatCard title="이번주 모임" value={stats.meetings.thisWeek} color="blue" />
            </div>

            {/* 리뷰 통계 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard title="평균 평점" value={stats.reviews.avgRating} suffix="점" color="yellow" />
              <StatCard title="총 좋아요" value={stats.reviews.totalLikes} color="pink" />
              <StatCard
                title="좋아요 비율"
                value={stats.reviews.total > 0 ? Math.round((stats.reviews.totalLikes / stats.reviews.total) * 100) : 0}
                suffix="%"
                color="pink"
              />
            </div>

            {/* 일별 추이 차트 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4">일별 가입자 (최근 7일)</h3>
                <div className="flex items-end gap-2 h-32">
                  {stats.users.dailySignups.map((day) => {
                    const maxCount = Math.max(...stats.users.dailySignups.map(d => d.count), 1)
                    const height = (day.count / maxCount) * 100
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-400">{day.count}</span>
                        <div
                          className="w-full bg-green-500 rounded-t"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                        <span className="text-[10px] text-gray-500">{day.date.slice(5)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4">일별 모임 생성 (최근 7일)</h3>
                <div className="flex items-end gap-2 h-32">
                  {stats.meetings.dailyMeetings.map((day) => {
                    const maxCount = Math.max(...stats.meetings.dailyMeetings.map(d => d.count), 1)
                    const height = (day.count / maxCount) * 100
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-400">{day.count}</span>
                        <div
                          className="w-full bg-blue-500 rounded-t"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                        <span className="text-[10px] text-gray-500">{day.date.slice(5)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 분포 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* 레벨별 사용자 */}
              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4">레벨별 사용자</h3>
                <div className="space-y-2">
                  {stats.users.byLevel.map((item) => (
                    <div key={item.level} className="flex items-center justify-between">
                      <span className="text-gray-400">Lv.{item.level}</span>
                      <span className="font-medium">{item._count.id}명</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 성별별 사용자 */}
              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4">성별별 사용자</h3>
                <div className="space-y-2">
                  {stats.users.byGender.map((item) => (
                    <div key={item.gender || 'unknown'} className="flex items-center justify-between">
                      <span className="text-gray-400">
                        {item.gender ? GENDER_LABELS[item.gender] || item.gender : '미제공'}
                      </span>
                      <span className="font-medium">{item._count.id}명</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 연령대별 사용자 */}
              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4">연령대별 사용자</h3>
                <div className="space-y-2">
                  {stats.users.byAgeRange
                    .sort((a, b) => (a.ageRange || '').localeCompare(b.ageRange || ''))
                    .map((item) => (
                      <div key={item.ageRange || 'unknown'} className="flex items-center justify-between">
                        <span className="text-gray-400">{item.ageRange || '미제공'}</span>
                        <span className="font-medium">{item._count.id}명</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* 모임 상태별 */}
              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4">모임 상태별</h3>
                <div className="space-y-2">
                  {stats.meetings.byStatus.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <span className="text-gray-400">{STATUS_LABELS[item.status] || item.status}</span>
                      <span className="font-medium">{item._count.id}개</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 게임 타입별 */}
              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4">게임 타입별</h3>
                <div className="space-y-2">
                  {stats.meetings.byGameType.map((item) => (
                    <div key={item.gameType} className="flex items-center justify-between">
                      <span className="text-gray-400">{GAME_TYPE_LABELS[item.gameType] || item.gameType}</span>
                      <span className="font-medium">{item._count.id}개</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 사용자 탭 */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="전체 사용자" value={stats.users.total} />
              <StatCard title="오늘 가입" value={stats.users.today} color="green" />
              <StatCard title="이번주 가입" value={stats.users.thisWeek} color="green" />
              <StatCard title="평균 레벨" value={
                stats.users.byLevel.length > 0
                  ? Math.round(
                      stats.users.byLevel.reduce((acc, item) => acc + item.level * item._count.id, 0) /
                      stats.users.total * 10
                    ) / 10
                  : 0
              } color="purple" />
            </div>

            {/* 검색 및 필터 */}
            <div className="bg-gray-800 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleUserSearch} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="닉네임 또는 이메일 검색"
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    검색
                  </button>
                </form>
                <div className="flex gap-2">
                  {[
                    { key: 'all' as const, label: '전체' },
                    { key: 'active' as const, label: '활성' },
                    { key: 'banned' as const, label: '정지' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => handleUserFilterChange(f.key)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        userFilter === f.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 사용자 목록 */}
            <div className="bg-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  사용자 목록
                  {adminUsers && (
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      총 {adminUsers.total}명
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => fetchAdminUsers(userPage)}
                  className="px-3 py-1 bg-gray-700 rounded-lg text-xs hover:bg-gray-600 transition-colors"
                >
                  새로고침
                </button>
              </div>

              {isLoadingUsers ? (
                <div className="text-center py-8 text-gray-400">로딩 중...</div>
              ) : adminUsers && adminUsers.users.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-xs border-b border-gray-700">
                          <th className="pb-3 pr-3">닉네임</th>
                          <th className="pb-3 pr-3">지역</th>
                          <th className="pb-3 pr-3">Lv</th>
                          <th className="pb-3 pr-3">호스트</th>
                          <th className="pb-3 pr-3">참여</th>
                          <th className="pb-3 pr-3">평가</th>
                          <th className="pb-3 pr-3">신고</th>
                          <th className="pb-3 pr-3">상태</th>
                          <th className="pb-3">관리</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {adminUsers.users.map((user) => {
                          const banStatus = formatBanStatus(user)
                          return (
                            <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                              <td className="py-3 pr-3">
                                <div>
                                  <span className="font-medium">{user.nickname}</span>
                                  {user.email && (
                                    <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 pr-3 text-gray-400 text-xs">{user.region || '-'}</td>
                              <td className="py-3 pr-3">Lv.{user.level}</td>
                              <td className="py-3 pr-3 text-center">
                                <span className="text-blue-400">{user.hostCount}</span>
                              </td>
                              <td className="py-3 pr-3 text-center">
                                <span className="text-green-400">{user._count.participations}</span>
                              </td>
                              <td className="py-3 pr-3 text-center">
                                {user.avgRating ? (
                                  <span className="text-yellow-400">{user.avgRating}</span>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                                {user.reviewCount > 0 && (
                                  <span className="text-xs text-gray-500 ml-1">({user.reviewCount})</span>
                                )}
                              </td>
                              <td className="py-3 pr-3 text-center">
                                <span className={user._count.reportsReceived > 0 ? 'text-red-400 font-medium' : 'text-gray-500'}>
                                  {user._count.reportsReceived}
                                </span>
                              </td>
                              <td className="py-3 pr-3">
                                {banStatus ? (
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    banStatus === '영구 정지' ? 'bg-red-500/20 text-red-400' :
                                    banStatus === '정지 만료' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-orange-500/20 text-orange-400'
                                  }`}>
                                    {banStatus}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">활성</span>
                                )}
                              </td>
                              <td className="py-3">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setShowSuspendModal(true)
                                    setSuspendReason('')
                                    setSuspendResult(null)
                                  }}
                                  className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500 transition-colors"
                                >
                                  관리
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 페이지네이션 */}
                  {adminUsers.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <button
                        onClick={() => handleUserPageChange(userPage - 1)}
                        disabled={userPage <= 1}
                        className="px-3 py-1 bg-gray-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                      >
                        이전
                      </button>
                      <span className="text-sm text-gray-400">
                        {userPage} / {adminUsers.totalPages}
                      </span>
                      <button
                        onClick={() => handleUserPageChange(userPage + 1)}
                        disabled={userPage >= adminUsers.totalPages}
                        className="px-3 py-1 bg-gray-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                      >
                        다음
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {adminUsers ? '검색 결과가 없습니다' : '사용자 데이터를 불러올 수 없습니다'}
                </div>
              )}
            </div>

            {/* 레벨별/성별별 분포 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4">레벨별 분포</h3>
                <div className="flex items-end gap-2 h-40">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                    const item = stats.users.byLevel.find(l => l.level === level)
                    const count = item?._count.id || 0
                    const maxCount = Math.max(...stats.users.byLevel.map(l => l._count.id), 1)
                    const height = (count / maxCount) * 100
                    return (
                      <div key={level} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-400">{count}</span>
                        <div
                          className="w-full bg-purple-500 rounded-t"
                          style={{ height: `${Math.max(height, 4)}%` }}
                        />
                        <span className="text-xs text-gray-500">Lv.{level}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4">성별 분포</h3>
                <div className="space-y-3">
                  {stats.users.byGender.map((item) => {
                    const percentage = stats.users.total > 0
                      ? Math.round((item._count.id / stats.users.total) * 100)
                      : 0
                    const label = item.gender ? GENDER_LABELS[item.gender] || item.gender : '미제공'
                    const colorClass = item.gender === 'male' ? 'bg-blue-500' :
                                       item.gender === 'female' ? 'bg-pink-500' : 'bg-gray-500'
                    return (
                      <div key={item.gender || 'unknown'}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400 text-sm">{label}</span>
                          <span className="text-sm">{item._count.id}명 ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colorClass} rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 사용자 정지 관리 모달 */}
            {showSuspendModal && selectedUser && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">사용자 관리</h3>
                    <button
                      onClick={() => {
                        setShowSuspendModal(false)
                        setSelectedUser(null)
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* 사용자 상세 정보 */}
                  <div className="bg-gray-700/50 rounded-xl p-4 mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">닉네임</span>
                      <span className="font-medium">{selectedUser.nickname}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">지역</span>
                      <span>{selectedUser.region || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">레벨</span>
                      <span>Lv.{selectedUser.level} (EXP: {selectedUser.exp})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">호스트 횟수</span>
                      <span className="text-blue-400">{selectedUser.hostCount}회</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">참여 횟수</span>
                      <span className="text-green-400">{selectedUser._count.participations}회</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">평균 평가</span>
                      <span className="text-yellow-400">
                        {selectedUser.avgRating ? `${selectedUser.avgRating}점 (${selectedUser.reviewCount}개)` : '평가 없음'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">받은 신고</span>
                      <span className={selectedUser._count.reportsReceived > 0 ? 'text-red-400 font-medium' : 'text-gray-500'}>
                        {selectedUser._count.reportsReceived}건
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">노쇼 횟수</span>
                      <span className={selectedUser.noShowCount > 0 ? 'text-red-400' : 'text-gray-500'}>
                        {selectedUser.noShowCount}회
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">가입일</span>
                      <span className="text-gray-300">
                        {new Date(selectedUser.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    {selectedUser.isBanned && (
                      <>
                        <div className="border-t border-gray-600 pt-2 mt-2" />
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">정지 상태</span>
                          <span className="text-red-400 font-medium">{formatBanStatus(selectedUser)}</span>
                        </div>
                        {selectedUser.bannedAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">정지일</span>
                            <span className="text-gray-300">
                              {new Date(selectedUser.bannedAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        )}
                        {selectedUser.bannedUntil && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">정지 해제일</span>
                            <span className="text-gray-300">
                              {new Date(selectedUser.bannedUntil).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        )}
                        {selectedUser.banReason && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">정지 사유</span>
                            <span className="text-gray-300 text-right max-w-[200px]">{selectedUser.banReason}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* 정지 사유 입력 */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">정지 사유 (선택)</label>
                    <input
                      type="text"
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="정지 사유를 입력해주세요"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>

                  {/* 결과 메시지 */}
                  {suspendResult && (
                    <div className={`p-3 rounded-lg text-sm mb-4 ${
                      suspendResult.includes('실패') || suspendResult.includes('오류')
                        ? 'bg-red-900/30 text-red-400 border border-red-800'
                        : 'bg-green-900/30 text-green-400 border border-green-800'
                    }`}>
                      {suspendResult}
                    </div>
                  )}

                  {/* 정지 액션 버튼 */}
                  <div className="space-y-2">
                    {selectedUser.isBanned ? (
                      <button
                        onClick={() => handleSuspendAction('unban')}
                        disabled={isSuspending}
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isSuspending ? '처리 중...' : '정지 해제'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSuspendAction('ban10')}
                          disabled={isSuspending}
                          className="w-full py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                          {isSuspending ? '처리 중...' : '10일 정지'}
                        </button>
                        <button
                          onClick={() => handleSuspendAction('ban30')}
                          disabled={isSuspending}
                          className="w-full py-3 bg-orange-700 text-white font-semibold rounded-xl hover:bg-orange-800 transition-colors disabled:opacity-50"
                        >
                          {isSuspending ? '처리 중...' : '30일 정지'}
                        </button>
                        <button
                          onClick={() => handleSuspendAction('banPermanent')}
                          disabled={isSuspending}
                          className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {isSuspending ? '처리 중...' : '영구 정지'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 모임 탭 */}
        {activeTab === 'meetings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="전체 모임" value={stats.meetings.total} />
              <StatCard title="오늘 생성" value={stats.meetings.today} color="blue" />
              <StatCard title="이번주 생성" value={stats.meetings.thisWeek} color="blue" />
              <StatCard title="총 참여" value={stats.participations.total} color="green" />
            </div>

            {/* 최근 모임 */}
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-4">최근 모임</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3">제목</th>
                      <th className="pb-3">게임</th>
                      <th className="pb-3">상태</th>
                      <th className="pb-3">호스트</th>
                      <th className="pb-3">참여자</th>
                      <th className="pb-3">모임일</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {stats.meetings.recent.map((meeting) => (
                      <tr key={meeting.id} className="border-b border-gray-700/50">
                        <td className="py-3 font-medium max-w-[200px] truncate">{meeting.title}</td>
                        <td className="py-3 text-gray-400">{GAME_TYPE_LABELS[meeting.gameType] || meeting.gameType}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            meeting.status === 'RECRUITING' ? 'bg-green-500/20 text-green-400' :
                            meeting.status === 'PLAYING' ? 'bg-blue-500/20 text-blue-400' :
                            meeting.status === 'COMPLETED' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {STATUS_LABELS[meeting.status] || meeting.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400">{meeting.host.nickname}</td>
                        <td className="py-3">{meeting._count.participants}/{meeting.maxParticipants}</td>
                        <td className="py-3 text-gray-400">
                          {new Date(meeting.meetingDate).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 상태별/게임별 분포 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4">상태별 분포</h3>
                <div className="space-y-3">
                  {stats.meetings.byStatus.map((item) => {
                    const percentage = stats.meetings.total > 0
                      ? Math.round((item._count.id / stats.meetings.total) * 100)
                      : 0
                    return (
                      <div key={item.status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400 text-sm">{STATUS_LABELS[item.status] || item.status}</span>
                          <span className="text-sm">{item._count.id}개 ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-gray-800 rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4">게임 타입별 분포</h3>
                <div className="space-y-3">
                  {stats.meetings.byGameType.map((item) => {
                    const percentage = stats.meetings.total > 0
                      ? Math.round((item._count.id / stats.meetings.total) * 100)
                      : 0
                    return (
                      <div key={item.gameType}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400 text-sm">{GAME_TYPE_LABELS[item.gameType] || item.gameType}</span>
                          <span className="text-sm">{item._count.id}개 ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 푸시 탭 */}
        {activeTab === 'push' && (
          <div className="space-y-6">
            {/* 푸시 통계 */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="총 구독"
                value={pushStats?.totalSubscriptions || 0}
                color="blue"
              />
              <StatCard
                title="구독 사용자"
                value={pushStats?.uniqueUsers || 0}
                color="green"
              />
            </div>

            {/* 푸시 발송 폼 */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">푸시 알림 발송</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">제목</label>
                  <input
                    type="text"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value)}
                    placeholder="알림 제목"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">메시지</label>
                  <textarea
                    value={pushMessage}
                    onChange={(e) => setPushMessage(e.target.value)}
                    placeholder="알림 메시지 내용"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">클릭시 이동 URL (선택)</label>
                  <input
                    type="text"
                    value={pushUrl}
                    onChange={(e) => setPushUrl(e.target.value)}
                    placeholder="/home"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {pushResult && (
                  <div className={`p-3 rounded-xl text-sm ${
                    pushResult.includes('완료')
                      ? 'bg-green-900/30 text-green-400 border border-green-800'
                      : 'bg-red-900/30 text-red-400 border border-red-800'
                  }`}>
                    {pushResult}
                  </div>
                )}

                <button
                  onClick={sendPush}
                  disabled={isSendingPush || !pushTitle || !pushMessage}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingPush ? '발송 중...' : '모든 구독자에게 푸시 발송'}
                </button>
              </div>
            </div>

            {/* 안내 */}
            <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700">
              <h4 className="font-medium mb-2 text-gray-300">푸시 알림 안내</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• iOS: PWA로 설치 후 알림 허용 필요 (iOS 16.4+)</li>
                <li>• Android: 브라우저에서 알림 허용 필요</li>
                <li>• 만료된 구독은 발송 시 자동으로 제거됩니다</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  suffix = '',
  color = 'default',
}: {
  title: string
  value: number
  suffix?: string
  color?: 'default' | 'green' | 'blue' | 'yellow' | 'pink' | 'purple'
}) {
  const colorClasses = {
    default: 'bg-gray-800',
    green: 'bg-green-900/30 border border-green-800',
    blue: 'bg-blue-900/30 border border-blue-800',
    yellow: 'bg-yellow-900/30 border border-yellow-800',
    pink: 'bg-pink-900/30 border border-pink-800',
    purple: 'bg-purple-900/30 border border-purple-800',
  }

  const textClasses = {
    default: 'text-white',
    green: 'text-green-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    pink: 'text-pink-400',
    purple: 'text-purple-400',
  }

  return (
    <div className={`${colorClasses[color]} rounded-2xl p-5`}>
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className={`text-3xl font-bold ${textClasses[color]}`}>
        {value.toLocaleString()}{suffix}
      </p>
    </div>
  )
}
