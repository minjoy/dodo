'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button, Card, Badge, Avatar } from '@/components/common'
import KakaoMap from '@/components/KakaoMap'
import {
  formatDate,
  formatTime,
  getGameTypeName,
  getGameTypeEmoji,
  getStatusName,
  getLevelName,
  calculateDistance,
  formatDistance,
} from '@/lib/utils'
import type { MeetingWithDetails } from '@/types'

const LEVEL_EMOJIS = ['🌱', '👋', '⭐', '👑', '🏆']

export default function MeetingDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <MeetingDetailContent />
    </Suspense>
  )
}

function MeetingDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [meeting, setMeeting] = useState<MeetingWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isReadying, setIsReadying] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [isKicking, setIsKicking] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<{ id: string; nickname: string } | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewIsLike, setReviewIsLike] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewedUserIds, setReviewedUserIds] = useState<string[]>([])
  const [prevStatus, setPrevStatus] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const meetingId = params.id as string
  const joinedFromInvite = searchParams.get('joined') === 'true'
  const fromInviteLink = searchParams.get('fromInvite') === 'true'
  const fromCreate = searchParams.get('fromCreate') === 'true'
  const fromEdit = searchParams.get('fromEdit') === 'true'
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 초대링크, 생성, 수정에서 온 경우 뒤로가기 시 홈으로 이동
  const shouldRedirectToHome = joinedFromInvite || fromInviteLink || fromCreate || fromEdit

  useEffect(() => {
    if (shouldRedirectToHome) {
      window.history.pushState(null, '', window.location.href)

      const handlePopState = () => {
        router.replace('/home')
      }

      window.addEventListener('popstate', handlePopState)
      return () => window.removeEventListener('popstate', handlePopState)
    }
  }, [shouldRedirectToHome, router])

  useEffect(() => {
    fetchMeeting()
  }, [meetingId])

  // 수동 새로고침 함수
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchMeeting()
    setTimeout(() => setIsRefreshing(false), 300)
  }

  // 모임 시작 1시간 전부터 5초마다 자동 폴링 (참여자 변경, 모임 시작/종료 상태 반영)
  useEffect(() => {
    if (!meeting) return

    const meetingDate = new Date(meeting.meetingDate)
    const oneHourBefore = new Date(meetingDate.getTime() - 60 * 60 * 1000)
    const now = new Date()

    // 활성 상태이고 모임 1시간 전부터만 폴링
    const isActiveStatus = ['RECRUITING', 'CLOSED', 'READY', 'PLAYING'].includes(meeting.status)
    const isWithinPollingWindow = now >= oneHourBefore

    if (isActiveStatus && isWithinPollingWindow) {
      const interval = setInterval(() => {
        fetchMeeting()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [meeting?.status, meeting?.meetingDate, meetingId])

  // 상태 변화 감지하여 토스트 표시
  useEffect(() => {
    if (meeting && prevStatus && prevStatus !== meeting.status) {
      if (meeting.status === 'COMPLETED' && prevStatus === 'PLAYING') {
        setToastMessage('모임이 종료되었습니다! 참여자를 평가해주세요.')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 5000)
      }
    }
    if (meeting) {
      setPrevStatus(meeting.status)
    }
  }, [meeting?.status, prevStatus])

  // 평가 정보 가져오기
  useEffect(() => {
    if (meeting?.status === 'COMPLETED' && session?.user?.id) {
      fetchReviewInfo()
    }
  }, [meeting?.status, session?.user?.id, meetingId])

  const fetchReviewInfo = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/review`)
      if (res.ok) {
        const data = await res.json()
        setReviewedUserIds(data.reviewedUserIds || [])
      }
    } catch (error) {
      console.error('Failed to fetch review info:', error)
    }
  }

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (showShareModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showShareModal])

  const fetchMeeting = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`)
      if (res.ok) {
        const data = await res.json()
        setMeeting(data)
      } else {
        router.push('/home')
      }
    } catch (error) {
      console.error('Failed to fetch meeting:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoin = async () => {
    if (!session?.user?.id) return

    setIsJoining(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/join`, {
        method: 'POST',
      })
      if (res.ok) {
        setToastMessage('모임에 참여했습니다!')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        fetchMeeting()
      }
    } catch (error) {
      console.error('Failed to join meeting:', error)
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeave = async () => {
    if (!session?.user?.id) return

    setIsJoining(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/join`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchMeeting()
      }
    } catch (error) {
      console.error('Failed to leave meeting:', error)
    } finally {
      setIsJoining(false)
    }
  }

  const handleCopyLink = () => {
    if (!meeting?.shareCode) return
    const url = `${window.location.origin}/join/${meeting.shareCode}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyCode = () => {
    if (!meeting?.shareCode) return
    navigator.clipboard.writeText(meeting.shareCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReady = async () => {
    if (!session?.user?.id) return

    setIsReadying(true)
    try {
      // 현재 위치 가져오기 (선택적)
      let latitude, longitude
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          })
          latitude = position.coords.latitude
          longitude = position.coords.longitude
        } catch {
          // 위치 권한 없어도 레디 가능
        }
      }

      const res = await fetch(`/api/meetings/${meetingId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      })
      if (res.ok) {
        fetchMeeting()
      } else {
        const data = await res.json()
        alert(data.message || '레디에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to ready:', error)
    } finally {
      setIsReadying(false)
    }
  }

  const handleCancelReady = async () => {
    if (!session?.user?.id) return

    setIsReadying(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/ready`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchMeeting()
      }
    } catch (error) {
      console.error('Failed to cancel ready:', error)
    } finally {
      setIsReadying(false)
    }
  }

  const handleStart = async () => {
    if (!session?.user?.id) return

    setIsStarting(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/start`, {
        method: 'POST',
      })
      if (res.ok) {
        fetchMeeting()
      } else {
        const data = await res.json()
        alert(data.message || '모임 시작에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to start meeting:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleEnd = async () => {
    if (!session?.user?.id) return
    if (!confirm('모임을 종료하시겠습니까? 종료 후에는 참여자들이 서로 평가할 수 있습니다.')) return

    setIsEnding(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/end`, {
        method: 'POST',
      })
      if (res.ok) {
        setToastMessage('모임이 종료되었습니다!')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        fetchMeeting()
      } else {
        const data = await res.json()
        alert(data.message || '모임 종료에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to end meeting:', error)
    } finally {
      setIsEnding(false)
    }
  }

  const handleKick = async (userId: string, nickname: string) => {
    if (!session?.user?.id) return
    if (!confirm(`${nickname}님을 강퇴하시겠습니까?`)) return

    setIsKicking(userId)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/kick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        setToastMessage(`${nickname}님이 강퇴되었습니다`)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        fetchMeeting()
      } else {
        const data = await res.json()
        alert(data.message || '강퇴에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to kick participant:', error)
    } finally {
      setIsKicking(null)
    }
  }

  const handleReview = async () => {
    if (!reviewTarget || !session?.user?.id) return

    setIsSubmittingReview(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revieweeId: reviewTarget.id,
          rating: reviewRating,
          comment: reviewComment || undefined,
          isLike: reviewIsLike,
        }),
      })

      if (res.ok) {
        setToastMessage(`${reviewTarget.nickname}님을 평가했습니다!`)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        setReviewedUserIds([...reviewedUserIds, reviewTarget.id])
        setShowReviewModal(false)
        setReviewTarget(null)
        setReviewRating(5)
        setReviewComment('')
        setReviewIsLike(false)
      } else {
        const data = await res.json()
        alert(data.message || '평가에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const openReviewModal = (userId: string, nickname: string) => {
    setReviewTarget({ id: userId, nickname })
    setReviewRating(5)
    setReviewComment('')
    setReviewIsLike(false)
    setShowReviewModal(true)
  }

  const handleBack = () => {
    // 생성/수정/초대링크에서 온 경우 홈으로 이동
    if (shouldRedirectToHome || document.referrer.includes('/create') || document.referrer.includes('/edit')) {
      router.replace('/home')
    } else {
      router.back()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-gray-400 font-medium">모임 정보 불러오는 중...</p>
      </div>
    )
  }

  if (!meeting) {
    return null
  }

  const isHost = session?.user?.id === meeting.hostId
  const isParticipant = meeting.participants.some(
    (p) => p.userId === session?.user?.id && p.status !== 'CANCELLED'
  )
  // 참여자 수에 호스트 포함 (+1)
  const totalParticipants = meeting._count.participants + 1
  const isFull = totalParticipants >= meeting.maxParticipants
  const canJoin =
    meeting.status === 'RECRUITING' &&
    !isHost &&
    !isParticipant &&
    !isFull &&
    (session?.user?.level || 1) >= meeting.minLevel

  const participationRate = (totalParticipants / meeting.maxParticipants) * 100
  const hostLevel = meeting.host.level as 1 | 2 | 3 | 4 | 5

  // 레디 관련 상태
  const now = new Date()
  const meetingDate = new Date(meeting.meetingDate)
  const oneHourBefore = new Date(meetingDate.getTime() - 60 * 60 * 1000)
  const canReady = now >= oneHourBefore && (meeting.status === 'RECRUITING' || meeting.status === 'CLOSED' || meeting.status === 'READY')
  const timeUntilReady = oneHourBefore.getTime() - now.getTime()

  // 현재 사용자의 레디 상태
  const myParticipation = meeting.participants.find(p => p.userId === session?.user?.id && p.status !== 'CANCELLED')
  const isMyReady = myParticipation?.isReady || false

  // 모든 참가자(호스트 제외)의 레디 상태
  const readyCount = meeting.participants.filter(p => p.status !== 'CANCELLED' && p.isReady).length
  const allParticipantsReady = meeting.participants.filter(p => p.status !== 'CANCELLED').every(p => p.isReady)

  // 모임 시작 가능 여부 (호스트이고, 호스트가 레디했고, 모임 시작 1시간 전인 경우)
  const canStart = isHost && canReady && isMyReady && (meeting.status === 'READY' || meeting.status === 'RECRUITING' || meeting.status === 'CLOSED')
  const isPlaying = meeting.status === 'PLAYING'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-28">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-100/50">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="font-bold text-gray-900">모임 상세</h1>
          <div className="flex items-center gap-1">
            {/* 새로고침 버튼 - 모임 진행 전/중일 때만 표시 */}
            {meeting && (meeting.status === 'RECRUITING' || meeting.status === 'CLOSED' || meeting.status === 'READY' || meeting.status === 'PLAYING') && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <svg
                  className={`w-6 h-6 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 지도 영역 */}
      <KakaoMap
        latitude={meeting.latitude}
        longitude={meeting.longitude}
        placeName={meeting.placeName}
        className="h-52"
      />

      {/* 메인 콘텐츠 */}
      <div className="px-4 py-6 space-y-4">
        {/* 게임 타입 + 상태 + 제목 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                <span className="text-2xl">{getGameTypeEmoji(meeting.gameType)}</span>
              </div>
              <span className="font-semibold text-gray-600">
                {getGameTypeName(meeting.gameType)}
              </span>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              isPlaying
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm shadow-blue-500/30'
                : meeting.status === 'RECRUITING' && !isFull
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm shadow-green-500/30'
                  : isFull
                    ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm shadow-orange-500/30'
                    : 'bg-gray-100 text-gray-500'
            }`}>
              {isPlaying ? '🎮 진행중' : isFull ? '마감' : getStatusName(meeting.status)}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{meeting.title}</h2>
        </div>

        {/* 일시 + 장소 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">일시</p>
              <p className="font-bold text-gray-900 text-lg">
                {formatDate(meeting.meetingDate)} {formatTime(meeting.meetingDate)}
              </p>
              <p className="text-sm text-gray-500">약 {meeting.duration}분 예정</p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">장소</p>
              <p className="font-bold text-gray-900 text-lg">{meeting.placeName}</p>
              <p className="text-sm text-gray-500">{meeting.address}</p>
            </div>
          </div>
        </div>

        {/* 호스트 정보 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/profile/${meeting.host.id}`)}
              className="flex items-center gap-4 text-left flex-1"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden bg-gray-100">
                  <Avatar
                    src={meeting.host.profileImage}
                    alt={meeting.host.nickname}
                    size="lg"
                    fallback={meeting.host.nickname}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                  <span className="text-sm">{LEVEL_EMOJIS[hostLevel - 1]}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-lg">
                    {meeting.host.nickname}
                  </span>
                  {(meeting.host.representativeBadge || meeting.host.representativeBadge2) && (
                    <div className="flex items-center gap-0.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-full px-1.5 py-0.5">
                      {meeting.host.representativeBadge && (
                        <span className="text-sm" title={meeting.host.representativeBadge.name}>
                          {meeting.host.representativeBadge.icon}
                        </span>
                      )}
                      {meeting.host.representativeBadge2 && (
                        <span className="text-sm" title={meeting.host.representativeBadge2.name}>
                          {meeting.host.representativeBadge2.icon}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span>모임 {meeting.host.meetingCount}회</span>
                  <span>좋아요 {meeting.host.likeReceived}</span>
                </div>
              </div>
            </button>
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm shadow-primary/30">
              호스트
            </div>
          </div>
        </div>

        {/* 모임 설명 */}
        {meeting.description && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📝</span>
              <h3 className="font-bold text-gray-900">모임 소개</h3>
            </div>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{meeting.description}</p>
          </div>
        )}

        {/* 참여 조건 + 참여자 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
          {/* 참여 조건 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⭐</span>
              <h3 className="font-bold text-gray-900">참여 조건</h3>
            </div>
            <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-xl">
              <span className="text-lg">{LEVEL_EMOJIS[meeting.minLevel - 1]}</span>
              <span className="font-semibold text-gray-800">
                Lv.{meeting.minLevel} {getLevelName(meeting.minLevel)} 이상
              </span>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* 레디 상태 안내 */}
          {(isHost || isParticipant) && !isPlaying && meeting.status !== 'COMPLETED' && (
            <div className={`rounded-xl p-4 ${canReady ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{canReady ? '✅' : '⏰'}</span>
                <div className="flex-1">
                  {canReady ? (
                    <>
                      <p className="font-semibold text-green-800">레디 가능!</p>
                      <p className="text-sm text-green-600">
                        모임 장소에 도착하면 레디해주세요 ({readyCount}/{meeting.participants.filter(p => p.status !== 'CANCELLED').length}명 레디)
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-700">레디 대기중</p>
                      <p className="text-sm text-gray-500">
                        모임 시작 1시간 전부터 레디할 수 있습니다
                        {timeUntilReady > 0 && (
                          <span className="ml-1">
                            ({Math.floor(timeUntilReady / (1000 * 60 * 60))}시간 {Math.floor((timeUntilReady % (1000 * 60 * 60)) / (1000 * 60))}분 후)
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 모임 진행중 표시 */}
          {isPlaying && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎮</span>
                <div>
                  <p className="font-semibold text-blue-800">모임 진행중!</p>
                  <p className="text-sm text-blue-600">즐거운 게임 되세요!</p>
                </div>
              </div>
            </div>
          )}

          <div className="h-px bg-gray-100" />

          {/* 참여자 목록 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">👥</span>
                <h3 className="font-bold text-gray-900">참여자</h3>
              </div>
              <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                isFull ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {totalParticipants}/{meeting.maxParticipants}명
              </span>
            </div>

            {/* 참여율 프로그레스 바 */}
            <div className="mb-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFull
                      ? 'bg-gradient-to-r from-orange-400 to-amber-500'
                      : 'bg-gradient-to-r from-primary to-primary-dark'
                  }`}
                  style={{ width: `${participationRate}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {/* 호스트를 참여자 리스트에 포함 */}
              {(() => {
                const hostAsParticipant = {
                  id: 'host',
                  user: meeting.host,
                  isReady: meeting.participants.find(p => p.userId === meeting.hostId)?.isReady || false,
                  readyLat: meeting.participants.find(p => p.userId === meeting.hostId)?.readyLat || null,
                  readyLng: meeting.participants.find(p => p.userId === meeting.hostId)?.readyLng || null,
                  isHost: true,
                }
                const allParticipants = [
                  hostAsParticipant,
                  ...meeting.participants
                    .filter((p) => p.status !== 'CANCELLED' && p.userId !== meeting.hostId)
                    .map(p => ({ ...p, isHost: false }))
                ]

                return allParticipants.map((participant) => {
                  const pLevel = (participant.user.level || 1) as 1 | 2 | 3 | 4 | 5
                  const isMe = participant.user.id === session?.user?.id
                  const isThisHost = participant.isHost
                  // 레디한 참가자의 약속장소와의 거리 계산
                  const readyDistance = participant.isReady && participant.readyLat && participant.readyLng
                    ? calculateDistance(
                        participant.readyLat,
                        participant.readyLng,
                        meeting.latitude,
                        meeting.longitude
                      )
                    : null
                  const alreadyReviewed = reviewedUserIds.includes(participant.user.id)
                  const isCompleted = meeting.status === 'COMPLETED'

                  return (
                    <div
                      key={participant.id}
                      className={`flex items-center justify-between rounded-xl px-3 py-3 transition-colors ${
                        isCompleted
                          ? 'bg-gray-50 border border-gray-100'
                          : participant.isReady
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <button
                        onClick={() => router.push(`/profile/${participant.user.id}`)}
                        className="flex items-center gap-3 flex-1"
                      >
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full border-2 overflow-hidden bg-gray-100 ${
                            isCompleted
                              ? 'border-gray-300'
                              : participant.isReady ? 'border-green-400' : 'border-gray-200'
                          }`}>
                            <Avatar
                              src={participant.user.profileImage}
                              alt={participant.user.nickname}
                              size="md"
                              fallback={participant.user.nickname}
                            />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                            <span className="text-xs">{LEVEL_EMOJIS[pLevel - 1]}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-900">
                              {participant.user.nickname}
                            </span>
                            {isThisHost && (
                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">호스트</span>
                            )}
                            {isMe && (
                              <span className="text-xs text-primary font-medium">(나)</span>
                            )}
                          </div>
                          {/* 대표 뱃지 표시 */}
                          {(participant.user.representativeBadge || participant.user.representativeBadge2) && (
                            <div className="flex items-center gap-0.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-full px-1.5 py-0.5 mt-0.5">
                              {participant.user.representativeBadge && (
                                <span className="text-xs">{participant.user.representativeBadge.icon}</span>
                              )}
                              {participant.user.representativeBadge2 && (
                                <span className="text-xs">{participant.user.representativeBadge2.icon}</span>
                              )}
                            </div>
                          )}
                          {/* 레디한 사람의 약속장소와의 거리 표시 */}
                          {!isCompleted && readyDistance !== null && (
                            <span className="text-xs text-green-600 mt-0.5">
                              📍 약속장소에서 {formatDistance(readyDistance)}
                            </span>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-2">
                        {/* 완료된 모임: 평가 버튼 */}
                        {isCompleted && !isMe && (isHost || isParticipant) && (
                          alreadyReviewed ? (
                            <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-500">
                              평가완료
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                openReviewModal(participant.user.id, participant.user.nickname)
                              }}
                              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-yellow-400 text-yellow-900 hover:bg-yellow-500 transition-colors"
                            >
                              ⭐ 평가
                            </button>
                          )
                        )}

                        {/* 호스트가 아닌 참가자에 대해 강퇴 버튼 (모임 시작 전에만) */}
                        {!isCompleted && isHost && !isMe && !isThisHost && !isPlaying && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleKick(participant.user.id, participant.user.nickname)
                            }}
                            disabled={isKicking === participant.user.id}
                            className="px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            {isKicking === participant.user.id ? '...' : '강퇴'}
                          </button>
                        )}

                        {/* 레디 상태 또는 레디 버튼 (완료되지 않은 경우만) */}
                        {!isCompleted && (
                          isMe && canReady ? (
                            <button
                              onClick={participant.isReady ? handleCancelReady : handleReady}
                              disabled={isReadying}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                                participant.isReady
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                              }`}
                            >
                              {isReadying ? '...' : participant.isReady ? '✓ 레디' : '레디'}
                            </button>
                          ) : !isPlaying && (
                            <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                              participant.isReady
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              {participant.isReady ? '✓ 레디' : '대기중'}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )
                })
              })()}
              {totalParticipants < meeting.maxParticipants && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border-2 border-dashed border-gray-200">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm text-gray-400 font-medium">
                    {meeting.maxParticipants - totalParticipants}자리 남음
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 호스트용 모임 설정 버튼 (스크롤 영역 내) */}
          {isHost && !isPlaying && meeting.status !== 'COMPLETED' && (
            <button
              onClick={() => router.push(`/meeting/${meetingId}/edit`)}
              className="w-full mt-4 py-3 px-4 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              모임 설정
            </button>
          )}

          {/* 참가자용 참여 취소 버튼 (스크롤 영역 내) */}
          {!isHost && isParticipant && !isPlaying && meeting.status !== 'COMPLETED' && (
            <button
              onClick={handleLeave}
              disabled={isJoining}
              className="w-full mt-4 py-3 px-4 rounded-xl font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              {isJoining ? (
                '처리 중...'
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  참여 취소
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-[1000px] mx-auto bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 pt-4 pb-8 safe-bottom">
        {/* 완료된 모임 */}
        {meeting.status === 'COMPLETED' ? (
          <div className="space-y-3">
            <div className="text-center text-sm text-gray-500 mb-2">
              ✅ 모임이 완료되었습니다. 참여자를 평가해주세요!
            </div>
            <button
              onClick={() => router.push('/home')}
              className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              🏠 홈으로 가기
            </button>
          </div>
        ) : isPlaying ? (
          isHost ? (
            <button
              onClick={handleEnd}
              disabled={isEnding}
              className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {isEnding ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  종료 중...
                </>
              ) : (
                <>
                  <span className="text-xl">🏁</span>
                  모임 종료하기
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center">
              🎮 모임 진행중
            </div>
          )
        ) : isHost ? (
          canStart ? (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {isStarting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  시작 중...
                </>
              ) : (
                <>
                  <span className="text-xl">🚀</span>
                  모임 시작하기
                </>
              )}
            </button>
          ) : canReady && !isMyReady ? (
            <button
              onClick={handleReady}
              disabled={isReadying}
              className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {isReadying ? '레디 중...' : (
                <>
                  <span className="text-xl">✋</span>
                  레디하고 시작하기
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              친구 초대하기
            </button>
          )
        ) : isParticipant ? (
          <button
            onClick={() => setShowShareModal(true)}
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            친구 초대하기
          </button>
        ) : canJoin ? (
          <button
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isJoining ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                참여 신청 중...
              </>
            ) : (
              <>
                참여하기
                <span className="text-xl">🎉</span>
              </>
            )}
          </button>
        ) : isFull ? (
          <button disabled className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gray-200 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2">
            <span className="text-xl">😢</span>
            모집 마감
          </button>
        ) : (
          <button disabled className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gray-200 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2">
            <span className="text-xl">🔒</span>
            참여 불가 (레벨 {meeting.minLevel} 이상 필요)
          </button>
        )}
        </div>
      </div>

      {/* 공유 모달 */}
      {showShareModal && meeting?.shareCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">모임 공유하기</h3>

            {/* 공유 코드 */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">모임 코드</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-center">
                  <span className="text-2xl font-bold tracking-widest font-mono">
                    {meeting.shareCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-3 bg-primary text-white font-semibold rounded-xl"
                >
                  복사
                </button>
              </div>
            </div>

            {/* 링크 복사 */}
            <button
              onClick={handleCopyLink}
              className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl mb-4 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              링크 복사하기
            </button>

            {copied && (
              <p className="text-center text-sm text-green-500 mb-4">복사되었습니다!</p>
            )}

            {meeting.password && (
              <p className="text-sm text-gray-500 text-center mb-4">
                이 모임은 비밀번호가 필요합니다
              </p>
            )}

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-3 text-gray-500 font-semibold"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 평가 모달 */}
      {showReviewModal && reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {reviewTarget.nickname}님 평가하기
            </h3>

            {/* 별점 */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">별점</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    {star <= reviewRating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>

            {/* 좋아요 */}
            <div className="mb-4">
              <button
                onClick={() => setReviewIsLike(!reviewIsLike)}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
                  reviewIsLike
                    ? 'bg-pink-100 text-pink-600 border-2 border-pink-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                }`}
              >
                <span className="text-xl">{reviewIsLike ? '❤️' : '🤍'}</span>
                {reviewIsLike ? '좋아요!' : '좋아요 보내기'}
              </button>
            </div>

            {/* 코멘트 */}
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">한줄평 (선택)</p>
              {/* 빠른 선택지 */}
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  '함께해서 즐거웠어요!',
                  '매너가 좋아요',
                  '다음에 또 만나요!',
                  '게임 실력이 좋아요',
                  '친절하고 재밌어요',
                ].map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => setReviewComment(text)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      reviewComment === text
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="직접 입력..."
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setReviewTarget(null)
                }}
                className="flex-1 py-3 text-gray-500 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReview}
                disabled={isSubmittingReview}
                className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                {isSubmittingReview ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    제출 중...
                  </>
                ) : (
                  '평가 제출'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
