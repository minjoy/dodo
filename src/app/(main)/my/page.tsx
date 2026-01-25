'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, Card, Badge, Avatar } from '@/components/common'
import { MeetingCard } from '@/components/meeting'
import { getLevelName } from '@/lib/utils'
import type { User, Meeting } from '@/types'

type MeetingWithDetails = Meeting & {
  host: User
  _count: { participants: number }
}

const LEVEL_COLORS = {
  1: 'from-green-400 to-emerald-500',
  2: 'from-blue-400 to-indigo-500',
  3: 'from-purple-400 to-pink-500',
  4: 'from-orange-400 to-red-500',
  5: 'from-yellow-400 to-amber-500',
}

const LEVEL_EMOJIS = ['🌱', '👋', '⭐', '👑', '🏆']

const LEVEL_INFO = [
  { level: 1, name: '새싹', emoji: '🌱', exp: 0, description: '경도의 세계에 오신 것을 환영해요!' },
  { level: 2, name: '루키', emoji: '👋', exp: 30, description: '모임에 참여하며 경험을 쌓고 있어요' },
  { level: 3, name: '레귤러', emoji: '⭐', exp: 100, description: '활발하게 활동하는 경도 플레이어에요' },
  { level: 4, name: '베테랑', emoji: '👑', exp: 200, description: '다양한 모임을 경험한 베테랑이에요' },
  { level: 5, name: '마스터', emoji: '🏆', exp: 500, description: '경도의 전설이 되었어요!' },
]

export default function MyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingWithDetails[]>([])
  const [pastMeetings, setPastMeetings] = useState<MeetingWithDetails[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [isLoading, setIsLoading] = useState(true)
  const [showLevelModal, setShowLevelModal] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const [userRes, meetingsRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/users/me/meetings'),
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
      }

      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json()
        const now = new Date()
        setUpcomingMeetings(
          meetingsData.filter((m: MeetingWithDetails) => new Date(m.meetingDate) >= now)
        )
        setPastMeetings(
          meetingsData.filter((m: MeetingWithDetails) => new Date(m.meetingDate) < now)
        )
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  // 레벨별 경험치 요구량
  const levelExpRequirements = [0, 30, 100, 200, 500]
  const currentLevelExp = user ? levelExpRequirements[user.level - 1] || 0 : 0
  const nextLevelExp = user ? levelExpRequirements[user.level] || 999 : 999
  const expProgress = user
    ? ((user.exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
    : 0

  const userLevel = (user?.level || 1) as 1 | 2 | 3 | 4 | 5

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100/50 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
          <button
            onClick={() => router.push('/settings')}
            className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* 프로필 카드 */}
        <div className={`bg-gradient-to-br ${LEVEL_COLORS[userLevel]} rounded-3xl p-6 text-white shadow-xl relative overflow-hidden`}>
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-[76px] h-[76px] rounded-full border border-white/30 overflow-hidden bg-white/20 flex items-center justify-center shadow-lg">
                  <Avatar
                    src={user?.profileImage || session?.user?.profileImage}
                    alt={user?.nickname || session?.user?.nickname || ''}
                    size="2xl"
                    fallback={user?.nickname || session?.user?.nickname || ''}
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl">{LEVEL_EMOJIS[userLevel - 1]}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold">
                    {user?.nickname || session?.user?.nickname}
                  </h2>
                </div>
                <button
                  onClick={() => setShowLevelModal(true)}
                  className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full hover:bg-white/30 transition-colors"
                >
                  <span className="text-sm font-semibold">Lv.{userLevel} {getLevelName(userLevel)}</span>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <p className="text-white/80 text-sm flex items-center gap-1 mt-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {user?.region || session?.user?.region}
                </p>
              </div>
            </div>

            {/* 경험치 바 */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">다음 레벨까지</span>
                <span className="font-bold">
                  {user?.exp || 0} / {nextLevelExp} EXP
                </span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min(expProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold">{user?.meetingCount || 0}</p>
                <p className="text-sm text-white/80 font-medium">참여</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold">{user?.hostCount || 0}</p>
                <p className="text-sm text-white/80 font-medium">개설</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                <p className="text-3xl font-bold">{user?.likeReceived || 0}</p>
                <p className="text-sm text-white/80 font-medium">좋아요</p>
              </div>
            </div>
          </div>
        </div>

        {/* 모임 탭 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-4 text-center font-bold transition-all relative ${
                activeTab === 'upcoming'
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>📅</span>
                참여 예정
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 text-xs font-bold rounded-full px-1.5 ${
                  activeTab === 'upcoming' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {upcomingMeetings.length}
                </span>
              </span>
              {activeTab === 'upcoming' && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-4 text-center font-bold transition-all relative ${
                activeTab === 'past'
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>📚</span>
                지난 모임
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 text-xs font-bold rounded-full px-1.5 ${
                  activeTab === 'past' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {pastMeetings.length}
                </span>
              </span>
              {activeTab === 'past' && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'upcoming' ? (
              upcomingMeetings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📭</span>
                  </div>
                  <p className="text-gray-500 font-medium mb-4">참여 예정인 모임이 없어요</p>
                  <Link href="/home">
                    <button className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold py-3 px-6 rounded-xl hover:bg-primary/20 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      모임 찾아보기
                    </button>
                  </Link>
                </div>
              )
            ) : pastMeetings.length > 0 ? (
              <div className="space-y-3">
                {pastMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🏃</span>
                </div>
                <p className="text-gray-500 font-medium">아직 참여한 모임이 없어요</p>
                <p className="text-gray-400 text-sm mt-1">첫 경도를 시작해보세요!</p>
              </div>
            )}
          </div>
        </div>

        {/* 메뉴 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <button className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="flex-1 text-left font-medium text-gray-800">알림 설정</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="flex-1 text-left font-medium text-gray-800">동네 변경</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="flex-1 text-left font-medium text-gray-800">고객센터</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 transition-colors"
          >
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span className="flex-1 text-left font-medium text-red-600">로그아웃</span>
          </button>
        </div>
      </div>

      {/* 레벨 설명 모달 */}
      {showLevelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">레벨 시스템</h3>
              <button
                onClick={() => setShowLevelModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-4">
                모임 참여와 호스팅으로 경험치를 얻어 레벨업하세요!
              </p>
              <div className="space-y-3">
                {LEVEL_INFO.map((info) => (
                  <div
                    key={info.level}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      userLevel === info.level
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-xl">{info.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Lv.{info.level} {info.name}</span>
                        {userLevel === info.level && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">현재</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">필요 경험치: {info.exp} EXP</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">경험치 획득 방법</span>
                </p>
                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                  <li>• 모임 참여 완료: +10 EXP</li>
                  <li>• 모임 개설 및 완료: +15 EXP</li>
                  <li>• 좋아요 받기: +2 EXP</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
