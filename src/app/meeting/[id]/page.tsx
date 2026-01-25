'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
} from '@/lib/utils'
import type { MeetingWithDetails } from '@/types'

const LEVEL_EMOJIS = ['🌱', '👋', '⭐', '👑', '🏆']

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [meeting, setMeeting] = useState<MeetingWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const meetingId = params.id as string

  useEffect(() => {
    fetchMeeting()
  }, [meetingId])

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

  const handleBack = () => {
    // 이전 페이지가 모임 생성 페이지라면 홈으로 이동
    if (document.referrer.includes('/create')) {
      router.push('/home')
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
  const isFull = meeting._count.participants >= meeting.maxParticipants
  const canJoin =
    meeting.status === 'RECRUITING' &&
    !isHost &&
    !isParticipant &&
    !isFull &&
    (session?.user?.level || 1) >= meeting.minLevel

  const participationRate = (meeting._count.participants / meeting.maxParticipants) * 100
  const hostLevel = meeting.host.level as 1 | 2 | 3 | 4 | 5

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
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
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
              meeting.status === 'RECRUITING' && !isFull
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm shadow-green-500/30'
                : isFull
                  ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-gray-100 text-gray-500'
            }`}>
              {isFull ? '마감' : getStatusName(meeting.status)}
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
              className="flex items-center gap-4 text-left"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full border border-gray-200 overflow-hidden bg-gray-100">
                  <Avatar
                    src={meeting.host.profileImage}
                    alt={meeting.host.nickname}
                    size="lg"
                    fallback={meeting.host.nickname}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                  <span className="text-xs">{LEVEL_EMOJIS[hostLevel - 1]}</span>
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
                {meeting._count.participants}/{meeting.maxParticipants}명
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

            <div className="flex flex-wrap gap-2">
              {meeting.participants
                .filter((p) => p.status !== 'CANCELLED')
                .map((participant) => {
                  const pLevel = (participant.user.level || 1) as 1 | 2 | 3 | 4 | 5
                  return (
                    <button
                      key={participant.id}
                      onClick={() => router.push(`/profile/${participant.user.id}`)}
                      className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors"
                    >
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full border border-gray-200 overflow-hidden">
                          <Avatar
                            src={participant.user.profileImage}
                            alt={participant.user.nickname}
                            size="sm"
                            fallback={participant.user.nickname}
                          />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                          <span className="text-[10px]">{LEVEL_EMOJIS[pLevel - 1]}</span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {participant.user.nickname}
                      </span>
                      {(participant.user.representativeBadge || participant.user.representativeBadge2) && (
                        <div className="flex items-center gap-0.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-full px-1 py-0.5">
                          {participant.user.representativeBadge && (
                            <span className="text-xs" title={participant.user.representativeBadge.name}>
                              {participant.user.representativeBadge.icon}
                            </span>
                          )}
                          {participant.user.representativeBadge2 && (
                            <span className="text-xs" title={participant.user.representativeBadge2.name}>
                              {participant.user.representativeBadge2.icon}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              {meeting._count.participants < meeting.maxParticipants && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border-2 border-dashed border-gray-200">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm text-gray-400 font-medium">
                    {meeting.maxParticipants - meeting._count.participants}자리 남음
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-4 pt-4 pb-8 safe-bottom">
        {isHost ? (
          <button
            onClick={() => router.push(`/meeting/${meetingId}/edit`)}
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-secondary text-white shadow-lg shadow-secondary/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            모임 관리
          </button>
        ) : isParticipant ? (
          <button
            onClick={handleLeave}
            disabled={isJoining}
            className="w-full py-4 px-6 rounded-2xl font-bold text-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            {isJoining ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                처리 중...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                참여 취소
              </>
            )}
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
    </div>
  )
}
