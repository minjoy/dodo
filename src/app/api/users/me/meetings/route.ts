import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface MeetingParticipant {
  userId: string
}

interface MeetingData {
  id: string
  hostId: string
  status: string
  participants: MeetingParticipant[]
}

// GET /api/users/me/meetings - 내 모임 목록
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'past' | null

    const now = new Date()
    // 시작시간으로부터 3시간이 지난 시점
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)

    // 기본 조건: 내가 호스트이거나 참여한 모임
    const baseWhere = {
      OR: [
        { hostId: userId },
        {
          participants: {
            some: {
              userId,
              status: {
                not: 'CANCELLED' as const,
              },
            },
          },
        },
      ],
    }

    // type에 따른 필터링
    // "지난 모임" 조건:
    // 1. COMPLETED 상태인 모임 또는
    // 2. 아직 시작되지 않았지만(PLAYING 아님) 시작시간이 3시간 이상 지난 모임
    const where = type === 'past'
      ? {
          ...baseWhere,
          OR: [
            ...baseWhere.OR,
          ],
          AND: [
            {
              OR: [
                { status: 'COMPLETED' as const },
                {
                  AND: [
                    { status: { not: 'PLAYING' as const } },
                    { meetingDate: { lt: threeHoursAgo } },
                  ],
                },
              ],
            },
          ],
        }
      : baseWhere

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            level: true,
            meetingCount: true,
            likeReceived: true,
          },
        },
        participants: {
          where: {
            status: { not: 'CANCELLED' },
          },
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: {
              where: {
                status: {
                  not: 'CANCELLED',
                },
              },
            },
          },
        },
      },
      orderBy: {
        meetingDate: 'desc',
      },
    })

    // 지난 모임의 경우 미평가 여부 확인
    if (type === 'past') {
      // 내가 작성한 리뷰 목록 가져오기
      const myReviews = await prisma.review.findMany({
        where: {
          reviewerId: userId,
        },
        select: {
          meetingId: true,
          revieweeId: true,
        },
      })

      // 모임별 내가 평가한 사용자 맵 생성
      const reviewedMap = new Map<string, Set<string>>()
      myReviews.forEach((review: { meetingId: string; revieweeId: string }) => {
        if (!reviewedMap.has(review.meetingId)) {
          reviewedMap.set(review.meetingId, new Set())
        }
        reviewedMap.get(review.meetingId)!.add(review.revieweeId)
      })

      // 미평가 여부 추가
      const meetingsWithUnreviewed = meetings.map((meeting: MeetingData) => {
        const reviewedUsers = reviewedMap.get(meeting.id) || new Set()

        // 평가 대상: 참여자 + 호스트 (나 제외)
        const targetUsers = [
          ...meeting.participants.map((p: MeetingParticipant) => p.userId),
          meeting.hostId,
        ].filter((id: string) => id !== userId)

        // 미평가 사용자가 있는지 확인
        const hasUnreviewed = meeting.status === 'COMPLETED' &&
          targetUsers.some((targetId: string) => !reviewedUsers.has(targetId))

        // participants 상세 정보 제거 (응답 크기 줄이기)
        const { participants, ...rest } = meeting
        return {
          ...rest,
          hasUnreviewed,
        }
      })

      return NextResponse.json(meetingsWithUnreviewed)
    }

    // 일반 조회 시 participants 상세 정보 제거
    const cleanMeetings = meetings.map(({ participants, ...rest }: MeetingData) => rest)
    return NextResponse.json(cleanMeetings)
  } catch (error) {
    console.error('Failed to fetch user meetings:', error)
    return NextResponse.json(
      { message: '모임 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
