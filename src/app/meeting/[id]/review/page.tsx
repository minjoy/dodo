'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/common'

interface Participant {
  id: string
  userId: string
  user: {
    id: string
    nickname: string
    profileImage: string | null
  }
}

interface Meeting {
  id: string
  title: string
  hostId: string
  host: {
    id: string
    nickname: string
    profileImage: string | null
  }
  participants: Participant[]
}

interface ReviewData {
  revieweeId: string
  rating: number
  isLike: boolean
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const meetingId = params.id as string

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reviews, setReviews] = useState<{ [userId: string]: ReviewData }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchMeeting()
  }, [meetingId])

  const fetchMeeting = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`)
      if (res.ok) {
        const data = await res.json()
        setMeeting(data)
      }
    } catch (error) {
      console.error('Failed to fetch meeting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 나를 제외한 모든 참가자 (호스트 포함)
  const otherPlayers = meeting
    ? [
        { userId: meeting.hostId, user: meeting.host },
        ...meeting.participants.map((p) => ({ userId: p.userId, user: p.user })),
      ].filter((p) => p.userId !== session?.user?.id)
    : []

  const handleRatingChange = (userId: string, rating: number) => {
    setReviews((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        revieweeId: userId,
        rating,
        isLike: prev[userId]?.isLike || false,
      },
    }))
  }

  const handleLikeToggle = (userId: string) => {
    setReviews((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        revieweeId: userId,
        rating: prev[userId]?.rating || 3,
        isLike: !prev[userId]?.isLike,
      },
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const reviewPromises = Object.values(reviews).map((review) =>
        fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId,
            ...review,
          }),
        })
      )

      await Promise.all(reviewPromises)
      setSubmitted(true)

      // 3초 후 홈으로 이동
      setTimeout(() => {
        router.push('/home')
      }, 3000)
    } catch (error) {
      console.error('Failed to submit reviews:', error)
      alert('평가 제출에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center px-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🎉</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">평가 완료!</h1>
          <p className="text-gray-500 mb-4">게임에 참여해주셔서 감사합니다</p>
          <p className="text-sm text-gray-400">잠시 후 홈으로 이동합니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-center text-gray-900">
            익명 평가하기
          </h1>
          <p className="text-sm text-center text-gray-500 mt-1">
            함께 게임한 멤버들을 평가해주세요
          </p>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {otherPlayers.map((player) => (
          <div
            key={player.userId}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <Avatar
                src={player.user.profileImage}
                alt={player.user.nickname}
                size="lg"
                fallback={player.user.nickname}
              />
              <div>
                <h3 className="font-bold text-gray-900">{player.user.nickname}</h3>
                <p className="text-sm text-gray-500">어땠나요?</p>
              </div>
            </div>

            {/* 별점 */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingChange(player.userId, star)}
                  className="transition-transform hover:scale-110"
                >
                  <span
                    className={`text-3xl ${
                      (reviews[player.userId]?.rating || 0) >= star
                        ? 'opacity-100'
                        : 'opacity-30'
                    }`}
                  >
                    ⭐
                  </span>
                </button>
              ))}
            </div>

            {/* 좋아요 버튼 */}
            <button
              onClick={() => handleLikeToggle(player.userId)}
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                reviews[player.userId]?.isLike
                  ? 'bg-pink-100 text-pink-600 border-2 border-pink-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent'
              }`}
            >
              <span className="text-xl">{reviews[player.userId]?.isLike ? '💖' : '🤍'}</span>
              {reviews[player.userId]?.isLike ? '좋아요 보냄!' : '좋아요 보내기'}
            </button>
          </div>
        ))}
      </div>

      {/* 제출 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(reviews).length === 0}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            Object.keys(reviews).length > 0 && !isSubmitting
              ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {isSubmitting ? '제출 중...' : '평가 완료하기'}
        </button>
        <button
          onClick={() => router.push('/home')}
          className="w-full py-3 text-gray-500 text-sm mt-2"
        >
          나중에 하기
        </button>
      </div>
    </div>
  )
}
