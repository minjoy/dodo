import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.supercost.co.kr'

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ranking`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // 동적 페이지: 공개 모임 초대 페이지
  let meetingPages: MetadataRoute.Sitemap = []
  try {
    const meetings = await prisma.meeting.findMany({
      where: {
        status: { in: ['RECRUITING', 'CLOSED', 'READY'] },
        password: null,
      },
      select: {
        shareCode: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    })

    meetingPages = meetings.map((meeting: { shareCode: string; updatedAt: Date }) => ({
      url: `${baseUrl}/join/${meeting.shareCode}`,
      lastModified: meeting.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))
  } catch {
    // DB 연결 실패 시 정적 페이지만 반환
  }

  // 동적 페이지: 유저 프로필
  let profilePages: MetadataRoute.Sitemap = []
  try {
    const users = await prisma.user.findMany({
      where: {
        meetingCount: { gte: 1 },
      },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    })

    profilePages = users.map((user: { id: string; updatedAt: Date }) => ({
      url: `${baseUrl}/profile/${user.id}`,
      lastModified: user.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))
  } catch {
    // DB 연결 실패 시 정적 페이지만 반환
  }

  return [...staticPages, ...meetingPages, ...profilePages]
}
