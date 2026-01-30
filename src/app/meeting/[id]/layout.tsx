import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getGameTypeName } from '@/lib/utils'

const SITE_URL = 'https://www.supercost.co.kr'

interface LayoutProps {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      select: {
        title: true,
        gameType: true,
        meetingDate: true,
        placeName: true,
        region: true,
        maxParticipants: true,
        host: {
          select: { nickname: true },
        },
        _count: {
          select: { participants: true },
        },
      },
    })

    if (!meeting) {
      return {
        title: '모임을 찾을 수 없습니다',
      }
    }

    const gameTypeName = getGameTypeName(meeting.gameType)
    const meetingDate = new Date(meeting.meetingDate)
    const dateStr = meetingDate.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })

    const title = `${meeting.title} - ${gameTypeName}`
    const description = `${dateStr} ${meeting.placeName} | ${meeting.host.nickname}님이 주최하는 ${gameTypeName} 모임 | ${meeting._count.participants + 1}/${meeting.maxParticipants}명`

    return {
      title,
      description,
      openGraph: {
        title: `${title} | 경도`,
        description,
        url: `${SITE_URL}/meeting/${id}`,
        images: [
          {
            url: '/og-default.png',
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | 경도`,
        description,
      },
    }
  } catch {
    return {
      title: '모임 상세',
    }
  }
}

export default function MeetingDetailLayout({ children }: LayoutProps) {
  return children
}
