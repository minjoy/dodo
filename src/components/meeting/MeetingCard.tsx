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
  const participationRate = (meeting._count.participants / meeting.maxParticipants) * 100

  return (
    <Link href={`/meeting/${meeting.id}`}>
      <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 group">
        {/* 상단: 게임 타입 + 상태 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center group-hover:from-primary/5 group-hover:to-primary/10 transition-colors">
              <span className="text-2xl">{getGameTypeEmoji(meeting.gameType)}</span>
            </div>
            <span className="text-sm font-semibold text-gray-500">
              {getGameTypeName(meeting.gameType)}
            </span>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            isRecruiting && !isFull
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm shadow-green-500/30'
              : isFull
                ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm shadow-orange-500/30'
                : 'bg-gray-100 text-gray-500'
          }`}>
            {isFull ? '마감' : getStatusName(meeting.status)}
          </div>
        </div>

        {/* 제목 */}
        <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-1 group-hover:text-primary transition-colors">
          {meeting.title}
        </h3>

        {/* 일시 + 장소 */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm">
            <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-3.5 h-3.5 text-primary"
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
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md text-xs">
                {getRelativeTime(meeting.meetingDate)}
              </span>
              <span className="text-gray-600">
                {formatDate(meeting.meetingDate)} {formatTime(meeting.meetingDate)}
              </span>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-7 h-7 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-3.5 h-3.5 text-secondary"
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
            <span className="text-gray-600 line-clamp-1">{meeting.placeName}</span>
          </div>
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

        {/* 하단: 호스트 + 인원 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                src={meeting.host.profileImage}
                alt={meeting.host.nickname}
                size="sm"
                fallback={meeting.host.nickname}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-[8px] text-white font-bold">{meeting.host.level}</span>
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-800 block">
                {meeting.host.nickname}
              </span>
              <span className="text-xs text-gray-400">호스트</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(Math.min(meeting._count.participants, 3))].map((_, i) => (
                <div key={i} className="w-7 h-7 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              ))}
            </div>
            <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
              isFull
                ? 'bg-orange-100 text-orange-600'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {meeting._count.participants}/{meeting.maxParticipants}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
