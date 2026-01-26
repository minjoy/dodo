'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface User {
  id: string
  nickname: string
  profileImage: string | null
  level: number
  exp: number
  meetingCount: number
  hostCount: number
  likeReceived: number
  region: string
  rank: number
  score: number
  representativeBadge: { id: string; name: string; icon: string } | null
  representativeBadge2: { id: string; name: string; icon: string } | null
}

interface Shout {
  id: string
  message: string
  createdAt: string
  user: {
    id: string
    nickname: string
    profileImage: string | null
    level: number
  }
}

// Fisher-Yates 셔플 알고리즘
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function ExplorePage() {
  const [users, setUsers] = useState<User[]>([])
  const [shouts, setShouts] = useState<Shout[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showShoutModal, setShowShoutModal] = useState(false)
  const [shoutMessage, setShoutMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canShout, setCanShout] = useState(true)
  const marqueeRef = useRef<HTMLDivElement>(null)

  // 떠들기 랜덤 순서 (shouts가 변경될 때만 재계산)
  const shuffledShouts = useMemo(() => {
    if (shouts.length === 0) return []
    // 랜덤으로 섞음 (중복 없이 한 번만 표시)
    return shuffleArray(shouts)
  }, [shouts])

  // 유저 랭킹 가져오기
  const fetchUsers = async (searchQuery = '') => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/users/ranking?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  // 떠들기 메시지 가져오기
  const fetchShouts = async () => {
    try {
      const res = await fetch('/api/shouts')
      if (res.ok) {
        const data = await res.json()
        setShouts(data)
      }
    } catch (error) {
      console.error('Failed to fetch shouts:', error)
    }
  }

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await Promise.all([fetchUsers(), fetchShouts()])
      setIsLoading(false)
    }
    init()
  }, [])

  // 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // 떠들기 제출
  const handleShoutSubmit = async () => {
    if (!shoutMessage.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/shouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: shoutMessage.trim() }),
      })

      if (res.ok) {
        setShoutMessage('')
        setShowShoutModal(false)
        setCanShout(false)
        fetchShouts()
      } else {
        const error = await res.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Failed to submit shout:', error)
      alert('떠들기 작성에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}`
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700'
    if (rank === 2) return 'bg-gray-100 text-gray-600'
    if (rank === 3) return 'bg-orange-100 text-orange-700'
    return 'bg-gray-50 text-gray-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">유저 찾기</h1>
        </div>
      </header>

      {/* 떠들기 전광판 */}
      {shouts.length > 0 && (
        <div className="bg-gradient-to-r from-primary to-primary-dark overflow-hidden">
          <div className="relative h-10 flex items-center">
            <div
              ref={marqueeRef}
              className="animate-marquee whitespace-nowrap flex items-center gap-8"
            >
              {shuffledShouts.map((shout, idx) => (
                <span
                  key={`${shout.id}-${idx}`}
                  className={`text-white text-sm flex items-center gap-2 ${idx === 0 ? 'pl-4' : ''}`}
                >
                  <span className="font-semibold">{shout.user.nickname}</span>
                  <span className="opacity-90">{shout.message}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 검색 & 떠들기 버튼 */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="닉네임 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowShoutModal(true)}
            className="px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium flex items-center gap-1 whitespace-nowrap"
          >
            📢 떠들기
          </button>
        </div>
      </div>

      {/* 유저 리스트 */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">
            {search ? '검색 결과' : '🏆 TOP 100'}
          </h2>
          {!search && (
            <span className="text-sm text-gray-500">경험치 + 활동점수 기준</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 hover:border-primary/30 transition-colors"
              >
                {/* 순위 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(user.rank)}`}>
                  {getRankBadge(user.rank)}
                </div>

                {/* 프로필 이미지 */}
                <div className="relative">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.nickname}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-lg">👤</span>
                    </div>
                  )}
                  {/* 대표 뱃지 (프로필 이미지 우하단) */}
                  {user.representativeBadge && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full text-sm flex items-center justify-center border border-gray-200 shadow-sm">
                      <span title={user.representativeBadge.name}>{user.representativeBadge.icon}</span>
                    </div>
                  )}
                </div>

                {/* 유저 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 truncate">{user.nickname}</span>
                    <span className="text-xs text-gray-400">Lv.{user.level}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>📍 {user.region}</span>
                    <span>•</span>
                    <span>모임 {user.meetingCount}회</span>
                    <span>•</span>
                    <span>❤️ {user.likeReceived}</span>
                  </div>
                </div>

                {/* 점수 */}
                <div className="text-right">
                  <div className="font-bold text-primary">{user.score.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">점</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 떠들기 모달 */}
      {showShoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">📢 떠들기</h3>
              <button
                onClick={() => setShowShoutModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              전광판에 메시지를 띄워보세요! (하루 1회)
            </p>

            <div className="relative mb-4">
              <textarea
                value={shoutMessage}
                onChange={(e) => setShoutMessage(e.target.value.slice(0, 50))}
                placeholder="하고 싶은 말을 입력하세요"
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                {shoutMessage.length}/50
              </div>
            </div>

            <button
              onClick={handleShoutSubmit}
              disabled={!shoutMessage.trim() || isSubmitting}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                shoutMessage.trim() && !isSubmitting
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isSubmitting ? '전송 중...' : '떠들기'}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  )
}
