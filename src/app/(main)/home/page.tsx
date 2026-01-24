'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, Badge, Avatar, Button } from '@/components/common'
import { MeetingCard } from '@/components/meeting'
import { getGameTypeEmoji, getGameTypeName } from '@/lib/utils'
import type { Meeting, User } from '@/types'

type MeetingWithDetails = Meeting & {
  host: User
  _count: { participants: number }
}

const GAME_TYPES = [
  { value: null, label: '전체', emoji: '🎮' },
  { value: 'GYEONGDO', label: '경찰과 도둑', emoji: '🚔' },
  { value: 'SULRAE', label: '술래잡기', emoji: '🏃' },
  { value: 'MUGUNGHWA', label: '무궁화', emoji: '🌺' },
  { value: 'PIGU', label: '피구', emoji: '🏐' },
  { value: 'OTHER', label: '기타', emoji: '🎯' },
]

export default function HomePage() {
  const { data: session } = useSession()
  const [meetings, setMeetings] = useState<MeetingWithDetails[]>([])
  const [selectedGameType, setSelectedGameType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMeetings()
  }, [session?.user?.region, selectedGameType])

  const fetchMeetings = async () => {
    if (!session?.user?.region) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        region: session.user.region,
        status: 'RECRUITING',
      })
      if (selectedGameType) {
        params.append('gameType', selectedGameType)
      }

      const res = await fetch(`/api/meetings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMeetings(data)
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const todayMeetings = meetings.filter((m) => {
    const meetingDate = new Date(m.meetingDate)
    const today = new Date()
    return meetingDate.toDateString() === today.toDateString()
  })

  const upcomingMeetings = meetings.filter((m) => {
    const meetingDate = new Date(m.meetingDate)
    const today = new Date()
    return meetingDate.toDateString() !== today.toDateString()
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-100/50">
        <div className="px-4 py-4 flex items-center justify-between">
          <button className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400 font-medium">내 동네</p>
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-900">
                  {session?.user?.region || '동네 설정'}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <Link href="/my">
              <div className="ring-2 ring-primary/20 rounded-full hover:ring-primary/40 transition-all">
                <Avatar
                  src={session?.user?.profileImage}
                  alt={session?.user?.nickname || ''}
                  size="sm"
                  fallback={session?.user?.nickname || ''}
                />
              </div>
            </Link>
          </div>
        </div>

        {/* 게임 타입 필터 */}
        <div className="px-4 pb-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {GAME_TYPES.map((type) => (
              <button
                key={type.value || 'all'}
                onClick={() => setSelectedGameType(type.value)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedGameType === type.value
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 hover:border-primary/30 hover:text-primary'
                }`}
              >
                <span className="text-lg">{type.emoji}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-gray-400 font-medium">모임을 찾고 있어요...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-5xl">🏃</span>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-accent rounded-xl flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-sm">🚔</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              아직 모임이 없어요
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              {session?.user?.region}에서 첫 번째 경도를<br/>시작해보세요!
            </p>
            <Link href="/create">
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98] transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                첫 모임 만들기
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 오늘의 경도 */}
            {todayMeetings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                    <span className="text-lg">🔥</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      오늘의 경도
                      <span className="inline-flex items-center justify-center min-w-[24px] h-6 bg-primary text-white text-xs font-bold rounded-full px-2">
                        {todayMeetings.length}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500">지금 바로 참여할 수 있어요</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {todayMeetings.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              </section>
            )}

            {/* 다가오는 모임 */}
            {upcomingMeetings.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-lg">📅</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      다가오는 모임
                      <span className="inline-flex items-center justify-center min-w-[24px] h-6 bg-gray-200 text-gray-700 text-xs font-bold rounded-full px-2">
                        {upcomingMeetings.length}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500">미리 일정을 잡아두세요</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {upcomingMeetings.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* 플로팅 버튼 */}
      <Link
        href="/create"
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-xl shadow-primary/40 flex items-center justify-center hover:shadow-2xl hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all z-50"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </Link>
    </div>
  )
}
