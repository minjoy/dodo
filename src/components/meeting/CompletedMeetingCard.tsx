'use client'

import Link from 'next/link'
import {
  getGameTypeName,
  getGameTypeEmoji,
  formatDate,
} from '@/lib/utils'
import type { Meeting, User } from '@/types'

interface CompletedMeetingCardProps {
  meeting: Meeting & {
    host: User
    _count: { participants: number }
  }
}

export default function CompletedMeetingCard({ meeting }: CompletedMeetingCardProps) {
  const totalParticipants = meeting._count.participants + 1

  return (
    <Link href={`/meeting/${meeting.id}`} className="block">
      <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 opacity-70 hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-3">
          {/* 게임 타입 이모지 */}
          <span className="text-lg">{getGameTypeEmoji(meeting.gameType)}</span>

          {/* 제목 및 정보 */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-700 text-sm line-clamp-1">
              {meeting.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span>{getGameTypeName(meeting.gameType)}</span>
              <span>·</span>
              <span>{formatDate(meeting.meetingDate)}</span>
              <span>·</span>
              <span>{totalParticipants}명 참여</span>
            </div>
          </div>

          {/* 종료됨 배지 */}
          <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full flex-shrink-0">
            종료됨
          </span>
        </div>
      </div>
    </Link>
  )
}
