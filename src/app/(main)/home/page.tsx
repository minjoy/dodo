'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MeetingCard } from '@/components/meeting'
import type { Meeting, User } from '@/types'

type MeetingWithDetails = Meeting & {
  host: User
  _count: { participants: number }
}

const GAME_TYPES = [
  { value: null, label: '전체' },
  { value: 'GYEONGDO', label: '🚔 경찰과 도둑' },
  { value: 'SULRAE', label: '🏃 술래잡기' },
  { value: 'MUGUNGHWA', label: '🌺 무궁화' },
  { value: 'PIGU', label: '🏐 피구' },
  { value: 'OTHER', label: '🎯 기타' },
]

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [meetings, setMeetings] = useState<MeetingWithDetails[]>([])
  const [selectedGameType, setSelectedGameType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [meetingCode, setMeetingCode] = useState('')
  const [codeError, setCodeError] = useState('')

  useEffect(() => {
    fetchMeetings()
  }, [session?.user?.region, selectedGameType])

  const handleCodeSearch = async () => {
    if (meetingCode.length !== 6) {
      setCodeError('6자리 코드를 입력해주세요')
      return
    }

    setCodeError('')
    try {
      const res = await fetch(`/api/meetings/code/${meetingCode.toUpperCase()}`)
      if (res.ok) {
        router.push(`/join/${meetingCode.toUpperCase()}`)
      } else {
        setCodeError('모임을 찾을 수 없습니다')
      }
    } catch {
      setCodeError('오류가 발생했습니다')
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 심플한 헤더 */}
      <header className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">내 동네</p>
              <h1 className="text-lg font-bold text-gray-900">
                {session?.user?.region || '동네 설정'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCodeInput(true)}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600 active:bg-gray-200"
              >
                코드 입력
              </button>
              <Link
                href="/my"
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* 필터 - 가로 스크롤 */}
        <div className="px-4 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {GAME_TYPES.map((type) => (
              <button
                key={type.value || 'all'}
                onClick={() => setSelectedGameType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedGameType === type.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 콘텐츠 */}
      <main className="px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              모임이 없어요
            </h2>
            <p className="text-gray-500 mb-6">
              첫 번째 모임을 만들어보세요!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold py-3 px-6 rounded-xl active:bg-primary-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              모임 만들기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}
      </main>

      {/* 플로팅 버튼 - 더 크고 명확하게 */}
      {meetings.length > 0 && (
        <Link
          href="/create"
          className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-50"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}

      {/* 코드 입력 모달 */}
      {showCodeInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">모임 코드 입력</h3>
            <input
              type="text"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="6자리 코드"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-xl tracking-widest font-mono uppercase focus:outline-none focus:border-primary"
            />
            {codeError && (
              <p className="mt-2 text-sm text-red-500">{codeError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCodeInput(false)
                  setMeetingCode('')
                  setCodeError('')
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleCodeSearch}
                className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl"
              >
                입장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
