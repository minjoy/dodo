'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import {
  formatDate,
  formatTime,
  getGameTypeName,
  getGameTypeEmoji,
} from '@/lib/utils'

interface Meeting {
  id: string
  title: string
  gameType: string
  meetingDate: string
  placeName: string
  maxParticipants: number
  hasPassword: boolean
  isHost: boolean
  isParticipant: boolean
  host: {
    nickname: string
  }
  _count: {
    participants: number
  }
}

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  // 뒤로가기 시 홈으로 이동
  useEffect(() => {
    // 히스토리가 없거나 외부에서 왔을 때를 위해 홈을 히스토리에 추가
    if (window.history.length <= 1) {
      window.history.replaceState({ fromJoin: true }, '', window.location.href)
    } else {
      window.history.pushState({ fromJoin: true }, '', window.location.href)
    }

    const handlePopState = (e: PopStateEvent) => {
      // 뒤로가기 시 항상 홈으로 이동
      e.preventDefault()
      router.replace('/home')
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [router])

  useEffect(() => {
    fetchMeeting()
  }, [code])

  const fetchMeeting = async () => {
    try {
      const res = await fetch(`/api/meetings/code/${code}`)
      if (res.ok) {
        const data = await res.json()
        setMeeting(data)

        // 이미 참가자이거나 호스트면 모임 상세 페이지로 이동
        if (data.isHost || data.isParticipant) {
          router.replace(`/meeting/${data.id}?fromInvite=true`)
          return
        }
      } else {
        setError('모임을 찾을 수 없습니다')
      }
    } catch {
      setError('모임 정보를 불러오는데 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!session) {
      // 로그인 후 이 페이지로 돌아오기
      signIn('kakao', { callbackUrl: `/join/${code}` })
      return
    }

    // 프로필 설정이 안되어 있으면 온보딩으로
    if (!session.user?.region) {
      router.push(`/onboarding?callbackUrl=/join/${code}`)
      return
    }

    if (!meeting) return

    setIsJoining(true)
    setError('')

    try {
      const res = await fetch(`/api/meetings/${meeting.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: meeting.hasPassword ? password : undefined }),
      })

      if (res.ok) {
        // 뒤로가기 시 홈으로 가도록 replace 사용
        router.replace(`/meeting/${meeting.id}?joined=true`)
      } else {
        const data = await res.json()
        setError(data.message || '입장에 실패했습니다')
      }
    } catch {
      setError('입장에 실패했습니다')
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !meeting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <div className="text-6xl mb-4">😢</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{error}</h1>
        <p className="text-gray-500 mb-6">코드를 다시 확인해주세요</p>
        <button
          onClick={() => router.push('/home')}
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl"
        >
          홈으로 가기
        </button>
      </div>
    )
  }

  if (!meeting) return null

  const isFull = meeting._count.participants >= meeting.maxParticipants

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white px-4 py-4 shadow-sm">
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => router.replace('/home')}
            className="absolute left-0 p-1"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-center text-gray-900">모임 입장</h1>
        </div>
      </header>

      {/* 모임 정보 */}
      <main className="flex-1 px-4 py-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{getGameTypeEmoji(meeting.gameType)}</span>
            <span className="text-sm text-gray-500">{getGameTypeName(meeting.gameType)}</span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">{meeting.title}</h2>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatDate(meeting.meetingDate)} {formatTime(meeting.meetingDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{meeting.placeName}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>호스트: {meeting.host.nickname}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>
                {meeting._count.participants}/{meeting.maxParticipants}명
                {isFull && <span className="text-orange-500 ml-2">(마감)</span>}
              </span>
            </div>
          </div>
        </div>

        {/* 비밀번호 입력 */}
        {meeting.hasPassword && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="px-4 pt-4 pb-8 bg-white border-t border-gray-100 safe-bottom">
        {status === 'loading' ? (
          <div className="py-4 text-center text-gray-500">로딩 중...</div>
        ) : !session ? (
          <button
            onClick={() => signIn('kakao', { callbackUrl: `/join/${code}` })}
            className="w-full py-4 bg-[#FEE500] text-[#191919] font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 3C6.477 3 2 6.463 2 10.691c0 2.726 1.818 5.122 4.546 6.485-.145.522-.93 3.36-.964 3.594 0 0-.02.163.086.225.106.062.23.014.23.014.303-.042 3.506-2.296 4.06-2.685.672.096 1.364.147 2.042.147 5.523 0 10-3.463 10-7.78C22 6.463 17.523 3 12 3Z"
                fill="#191919"
              />
            </svg>
            카카오 로그인 후 입장하기
          </button>
        ) : isFull ? (
          <button
            disabled
            className="w-full py-4 bg-gray-200 text-gray-400 font-semibold rounded-xl"
          >
            모집 마감
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={isJoining || (meeting.hasPassword && !password)}
            className={`w-full py-4 font-semibold rounded-xl transition-colors ${
              isJoining || (meeting.hasPassword && !password)
                ? 'bg-gray-200 text-gray-400'
                : 'bg-primary text-white active:bg-primary-dark'
            }`}
          >
            {isJoining ? '입장 중...' : '모임 입장하기'}
          </button>
        )}
      </div>
    </div>
  )
}
