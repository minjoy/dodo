'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button, Card, Badge, Avatar } from '@/components/common'
import { MeetingCard } from '@/components/meeting'
import { getLevelName } from '@/lib/utils'
import type { User, Meeting } from '@/types'

type MeetingWithDetails = Meeting & {
  host: User
  _count: { participants: number }
}

export default function MyPage() {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [upcomingMeetings, setUpcomingMeetings] = useState<MeetingWithDetails[]>([])
  const [pastMeetings, setPastMeetings] = useState<MeetingWithDetails[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">마이페이지</h1>
          <button className="p-2">
            <svg
              className="w-6 h-6 text-gray-600"
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

      <div className="px-4 py-4 space-y-4">
        {/* 프로필 카드 */}
        <Card className="bg-gradient-to-br from-secondary to-secondary/80 text-white">
          <div className="flex items-center gap-4 mb-4">
            <Avatar
              src={user?.profileImage || session?.user?.profileImage}
              alt={user?.nickname || session?.user?.nickname || ''}
              size="xl"
              fallback={user?.nickname || session?.user?.nickname || ''}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">
                  {user?.nickname || session?.user?.nickname}
                </h2>
                <Badge
                  variant="level"
                  level={(user?.level || 1) as 1 | 2 | 3 | 4 | 5}
                  size="sm"
                />
              </div>
              <p className="text-white/70 text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {user?.region || session?.user?.region}
              </p>
            </div>
          </div>

          {/* 경험치 바 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                {getLevelName(user?.level || 1)} Lv.{user?.level || 1}
              </span>
              <span>
                {user?.exp || 0} / {nextLevelExp} EXP
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${Math.min(expProgress, 100)}%` }}
              />
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{user?.meetingCount || 0}</p>
              <p className="text-sm text-white/70">참여</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{user?.hostCount || 0}</p>
              <p className="text-sm text-white/70">개설</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{user?.likeReceived || 0}</p>
              <p className="text-sm text-white/70">좋아요</p>
            </div>
          </div>
        </Card>

        {/* 모임 탭 */}
        <div>
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500'
              }`}
            >
              참여 예정 ({upcomingMeetings.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'past'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500'
              }`}
            >
              지난 모임 ({pastMeetings.length})
            </button>
          </div>

          {activeTab === 'upcoming' ? (
            upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-4">참여 예정인 모임이 없어요</p>
                <Link href="/home">
                  <Button variant="outline" size="sm">
                    모임 찾아보기
                  </Button>
                </Link>
              </div>
            )
          ) : pastMeetings.length > 0 ? (
            pastMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>아직 참여한 모임이 없어요</p>
            </div>
          )}
        </div>

        {/* 메뉴 */}
        <Card padding="none">
          <button className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <span className="text-gray-700">알림 설정</span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <span className="text-gray-700">동네 변경</span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <span className="text-gray-700">고객센터</span>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-4 py-4 text-red-500"
          >
            <span>로그아웃</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </Card>
      </div>
    </div>
  )
}
