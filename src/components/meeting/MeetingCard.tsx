'use client'

import Link from 'next/link'
import { Card, Badge, Avatar } from '@/components/common'
import {
  formatDate,
  formatTime,
  getRelativeTime,
  getGameTypeName,
  getGameTypeEmoji,
  getStatusColor,
  getStatusName,
} from '@/lib/utils'
import type { Meeting, User } from '@/types'

interface MeetingCardProps {
  meeting: Meeting & {
    host: User
    _count: { participants: number }
  }
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const isFull = meeting._count.participants >= meeting.maxParticipants
  const isRecruiting = meeting.status === 'RECRUITING'

  return (
    <Link href={`/meeting/${meeting.id}`}>
      <Card clickable className="mb-3">
        {/* 상단: 게임 타입 + 상태 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getGameTypeEmoji(meeting.gameType)}</span>
            <span className="text-sm font-medium text-gray-600">
              {getGameTypeName(meeting.gameType)}
            </span>
          </div>
          <Badge
            variant={isRecruiting && !isFull ? 'success' : 'default'}
            size="sm"
            className={isFull ? 'bg-orange-100 text-orange-700' : ''}
          >
            {isFull ? '모집완료' : getStatusName(meeting.status)}
          </Badge>
        </div>

        {/* 제목 */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1">
          {meeting.title}
        </h3>

        {/* 일시 + 장소 */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 mr-2 text-gray-400"
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
            <span className="text-primary font-medium mr-2">
              {getRelativeTime(meeting.meetingDate)}
            </span>
            <span>
              {formatDate(meeting.meetingDate)} {formatTime(meeting.meetingDate)}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 mr-2 text-gray-400"
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
            <span className="line-clamp-1">{meeting.placeName}</span>
          </div>
        </div>

        {/* 하단: 호스트 + 인원 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Avatar
              src={meeting.host.profileImage}
              alt={meeting.host.nickname}
              size="sm"
              fallback={meeting.host.nickname}
            />
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-700">
                {meeting.host.nickname}
              </span>
              <Badge variant="level" level={meeting.host.level as 1 | 2 | 3 | 4 | 5} size="sm">
                Lv.{meeting.host.level}
              </Badge>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <svg
              className="w-4 h-4 mr-1 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className={isFull ? 'text-orange-600 font-medium' : 'text-gray-600'}>
              {meeting._count.participants}/{meeting.maxParticipants}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
