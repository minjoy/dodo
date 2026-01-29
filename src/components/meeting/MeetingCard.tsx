'use client'

import Link from 'next/link'
import {
  formatDate,
  formatTime,
  isToday,
  getGameTypeName,
  getGameTypeEmoji,
} from '@/lib/utils'
import type { Meeting, User } from '@/types'

interface MeetingCardProps {
  meeting: Meeting & {
    host: User
    _count: { participants: number }
  }
  isAuthenticated?: boolean
  onLoginRequired?: () => void
}

export default function MeetingCard({ meeting, isAuthenticated = true, onLoginRequired }: MeetingCardProps) {
  // 참여자 수에 호스트 포함 (+1)
  const totalParticipants = meeting._count.participants + 1
  const isFull = totalParticipants >= meeting.maxParticipants
  const spotsLeft = meeting.maxParticipants - totalParticipants

  // 시작시간 초과 여부 확인 (시작되지 않은 상태에서 시작시간이 지난 경우)
  const now = new Date()
  const meetingDate = new Date(meeting.meetingDate)
  const isOverdue = meeting.status !== 'PLAYING' && meeting.status !== 'COMPLETED' && meetingDate < now

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated && onLoginRequired) {
      e.preventDefault()
      onLoginRequired()
    }
  }

  return (
    <Link href={`/meeting/${meeting.id}`} className="block" onClick={handleClick}>
      <div className="bg-white rounded-2xl p-4 shadow-sm active:bg-gray-50 transition-colors">
        {/* 상단: 게임 타입 + 인원 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getGameTypeEmoji(meeting.gameType)}</span>
            <span className="text-sm text-gray-500 font-medium">
              {getGameTypeName(meeting.gameType)}
            </span>
          </div>
          <div className={`text-sm font-bold ${isFull ? 'text-orange-500' : 'text-primary'}`}>
            {isFull ? '마감' : `${spotsLeft}자리 남음`}
          </div>
        </div>

        {/* 제목 */}
        <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-1">
          {meeting.title}
        </h3>

        {/* 핵심 정보: 언제, 어디서 */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-500' : ''}`}>
            {isOverdue ? (
              // 시작시간 초과 시 경고 시계 아이콘
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                <circle cx="18" cy="6" r="4" fill="currentColor" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="white" d="M18 4v2m0 2h.01" />
              </svg>
            ) : (
              // 일반 시계 아이콘
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className={isOverdue ? 'font-medium' : ''}>{formatDate(meeting.meetingDate)} {formatTime(meeting.meetingDate)}</span>
            {isToday(meeting.meetingDate) && !isOverdue && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">오늘</span>
            )}
            {isOverdue && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">시작시간 초과</span>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{meeting.placeName}</span>
        </div>

        {/* 하단: 호스트 정보 + 인원수 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500">
                {meeting.host.nickname.charAt(0)}
              </span>
            </div>
            <span className="text-sm text-gray-500">{meeting.host.nickname}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>{totalParticipants}/{meeting.maxParticipants}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
