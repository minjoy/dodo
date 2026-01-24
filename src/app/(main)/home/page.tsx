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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
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
            <span className="font-semibold text-gray-900">
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
          <div className="flex items-center gap-3">
            <button className="relative p-2">
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
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <Link href="/my">
              <Avatar
                src={session?.user?.profileImage}
                alt={session?.user?.nickname || ''}
                size="sm"
                fallback={session?.user?.nickname || ''}
              />
            </Link>
          </div>
        </div>

        {/* 게임 타입 필터 */}
        <div className="px-4 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {GAME_TYPES.map((type) => (
              <button
                key={type.value || 'all'}
                onClick={() => setSelectedGameType(type.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedGameType === type.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{type.emoji}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏃</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              아직 모임이 없어요
            </h3>
            <p className="text-gray-500 mb-6">
              {session?.user?.region}에서 첫 번째 경도를 시작해보세요!
            </p>
            <Link href="/create">
              <Button>모임 만들기</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* 오늘의 경도 */}
            {todayMeetings.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-primary">오늘</span>의 경도
                  <Badge variant="primary" size="sm">
                    {todayMeetings.length}
                  </Badge>
                </h2>
                {todayMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </section>
            )}

            {/* 다가오는 모임 */}
            {upcomingMeetings.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  다가오는 모임
                  <Badge variant="default" size="sm">
                    {upcomingMeetings.length}
                  </Badge>
                </h2>
                {upcomingMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} />
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {/* 플로팅 버튼 */}
      <Link
        href="/create"
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors z-50"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </Link>
    </div>
  )
}
