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
    recent: {
      id: string
      nickname: string
      region: string
      level: number
      exp: number
      ageRange: string | null
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            {/* 최근 가입자 */}
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-4">최근 가입자</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3">닉네임</th>
                      <th className="pb-3">지역</th>
                      <th className="pb-3">연령대</th>
                      <th className="pb-3">레벨</th>
                      <th className="pb-3">경험치</th>
                      <th className="pb-3">가입일</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {stats.users.recent.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700/50">
                        <td className="py-3 font-medium">{user.nickname}</td>
                        <td className="py-3 text-gray-400">{user.region}</td>
                        <td className="py-3 text-gray-400">{user.ageRange || '-'}</td>
                        <td className="py-3">Lv.{user.level}</td>
                        <td className="py-3 text-gray-400">{user.exp} EXP</td>
                        <td className="py-3 text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 레벨별 분포 */}
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
