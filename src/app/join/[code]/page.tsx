import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getGameTypeName } from '@/lib/utils'
import JoinPageClient from './JoinPageClient'

const SITE_URL = 'https://www.supercost.co.kr'

interface PageProps {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { shareCode: code },
      select: {
        title: true,
        gameType: true,
        meetingDate: true,
        placeName: true,
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
        title: '모임을 찾을 수 없습니다 | 경도',
        description: '존재하지 않는 모임입니다.',
      }
    }

    const totalParticipants = meeting._count.participants + 1
    const gameTypeName = getGameTypeName(meeting.gameType)
    const meetingDate = new Date(meeting.meetingDate)
    const dateStr = `${meetingDate.getMonth() + 1}/${meetingDate.getDate()}`

    const title = `${meeting.host.nickname}님이 초대합니다! | ${meeting.title}`
    const description = `${gameTypeName} | ${dateStr} ${meeting.placeName} | ${totalParticipants}/${meeting.maxParticipants}명 참여중`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/join/${code}`,
        siteName: '경도',
        locale: 'ko_KR',
        type: 'website',
        images: [
          {
            url: `${SITE_URL}/og-invite.png`,
            width: 1200,
            height: 630,
            alt: `${meeting.title} - 경도 모임 초대`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${SITE_URL}/og-invite.png`],
      },
    }
  } catch {
    return {
      title: '모임 초대 | 경도',
      description: '경도에서 함께 놀아요!',
    }
  }
}

export default async function JoinPage({ params }: PageProps) {
  const { code } = await params
  return <JoinPageClient code={code} />
}
