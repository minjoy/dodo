import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getLevelName } from '@/lib/utils'

const SITE_URL = 'https://www.supercost.co.kr'

interface LayoutProps {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        nickname: true,
        level: true,
        region: true,
        meetingCount: true,
        bio: true,
      },
    })

    if (!user) {
      return {
        title: '프로필을 찾을 수 없습니다',
      }
    }

    const levelName = getLevelName(user.level)
    const title = `${user.nickname}님의 프로필`
    const description = user.bio
      ? `${user.bio} | Lv.${user.level} ${levelName} | ${user.region} | 모임 ${user.meetingCount}회 참여`
      : `Lv.${user.level} ${levelName} | ${user.region} | 모임 ${user.meetingCount}회 참여`

    return {
      title,
      description,
      alternates: {
        canonical: `/profile/${id}`,
      },
      openGraph: {
        title: `${title} | 경도`,
        description,
        url: `${SITE_URL}/profile/${id}`,
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
        card: 'summary',
        title: `${title} | 경도`,
        description,
      },
    }
  } catch {
    return {
      title: '유저 프로필',
    }
  }
}

export default function ProfileLayout({ children }: LayoutProps) {
  return children
}
