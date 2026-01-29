'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MeetingCard } from '@/components/meeting'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import type { User, Meeting } from '@/types'

type MeetingWithDetails = Meeting & {
  host: User
  _count: { participants: number }
  hasUnreviewed?: boolean
}

export default function PastMeetingsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [meetings, setMeetings] = useState<MeetingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPastMeetings()
  }, [])

  const fetchPastMeetings = async () => {
    try {
      const res = await fetchWithAuth('/api/users/me/meetings?type=past')
      if (res.ok) {
        const data = await res.json()
        setMeetings(data)
      }
    } catch (error) {
      console.error('Failed to fetch past meetings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-gray-400 font-medium">모임 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">지난 모임</h1>
          <span className="text-sm text-gray-500">{meetings.length}개</span>
        </div>
      </header>

      <div className="px-4 py-4">
        {meetings.length > 0 ? (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="relative">
                <MeetingCard meeting={meeting} hideSpotsLeft />
                {/* 미평가 알림 뱃지 */}
                {meeting.hasUnreviewed && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏃</span>
            </div>
            <p className="text-gray-500 font-medium">아직 참여한 모임이 없어요</p>
            <p className="text-gray-400 text-sm mt-1">첫 경도를 시작해보세요!</p>
          </div>
        )}
      </div>
    </div>
  )
}
