'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button, Card, Badge, Avatar } from '@/components/common'
import {
  formatDate,
  formatTime,
  getGameTypeName,
  getGameTypeEmoji,
  getStatusName,
  getLevelName,
} from '@/lib/utils'
import type { MeetingWithDetails } from '@/types'

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [meeting, setMeeting] = useState<MeetingWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  const meetingId = params.id as string

  useEffect(() => {
    fetchMeeting()
  }, [meetingId])

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2">
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
          <h1 className="font-semibold text-gray-900">모임 상세</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* 지도 영역 (플레이스홀더) */}
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2"
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
          <p className="text-sm">{meeting.placeName}</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-4 py-4 space-y-4">
        {/* 게임 타입 + 상태 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getGameTypeEmoji(meeting.gameType)}</span>
            <span className="font-medium text-gray-600">
              {getGameTypeName(meeting.gameType)}
            </span>
          </div>
          <Badge
            variant={meeting.status === 'RECRUITING' && !isFull ? 'success' : 'default'}
          >
            {isFull ? '모집완료' : getStatusName(meeting.status)}
          </Badge>
        </div>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-900">{meeting.title}</h2>

        {/* 일시 + 장소 */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">일시</p>
                <p className="font-medium text-gray-900">
                  {formatDate(meeting.meetingDate)} {formatTime(meeting.meetingDate)}
                </p>
                <p className="text-sm text-gray-500">약 {meeting.duration}분</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
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
              </div>
              <div>
                <p className="text-sm text-gray-500">장소</p>
                <p className="font-medium text-gray-900">{meeting.placeName}</p>
                <p className="text-sm text-gray-500">{meeting.address}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 호스트 정보 */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={meeting.host.profileImage}
                alt={meeting.host.nickname}
                size="lg"
                fallback={meeting.host.nickname}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {meeting.host.nickname}
                  </span>
                  <Badge
                    variant="level"
                    level={meeting.host.level as 1 | 2 | 3 | 4 | 5}
                    size="sm"
                  />
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span>모임 {meeting.host.meetingCount}회</span>
                  <span>좋아요 {meeting.host.likeReceived}</span>
                </div>
              </div>
            </div>
            <Badge variant="primary" size="sm">
              호스트
            </Badge>
          </div>
        </Card>

        {/* 모임 설명 */}
        {meeting.description && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-2">모임 소개</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{meeting.description}</p>
          </Card>
        )}

        {/* 참여 조건 */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">참여 조건</h3>
          <div className="flex items-center gap-2">
            <Badge variant="level" level={meeting.minLevel as 1 | 2 | 3 | 4 | 5}>
              Lv.{meeting.minLevel} {getLevelName(meeting.minLevel)} 이상
            </Badge>
          </div>
        </Card>

        {/* 참여자 목록 */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">참여자</h3>
            <span className="text-sm text-gray-500">
              {meeting._count.participants}/{meeting.maxParticipants}명
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {meeting.participants
              .filter((p) => p.status !== 'CANCELLED')
              .map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1.5"
                >
                  <Avatar
                    src={participant.user.profileImage}
                    alt={participant.user.nickname}
                    size="xs"
                    fallback={participant.user.nickname}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {participant.user.nickname}
                  </span>
                </div>
              ))}
            {meeting._count.participants < meeting.maxParticipants && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 border-2 border-dashed border-gray-300">
                <span className="text-sm text-gray-400">
                  +{meeting.maxParticipants - meeting._count.participants} 모집중
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
        {isHost ? (
          <Button fullWidth size="lg" variant="secondary">
            모임 관리
          </Button>
        ) : isParticipant ? (
          <Button
            fullWidth
            size="lg"
            variant="outline"
            onClick={handleLeave}
            isLoading={isJoining}
          >
            참여 취소
          </Button>
        ) : canJoin ? (
          <Button fullWidth size="lg" onClick={handleJoin} isLoading={isJoining}>
            참여하기
          </Button>
        ) : isFull ? (
          <Button fullWidth size="lg" disabled>
            모집 마감
          </Button>
        ) : (
          <Button fullWidth size="lg" disabled>
            참여 불가 (레벨 {meeting.minLevel} 이상)
          </Button>
        )}
      </div>
    </div>
  )
}
