import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/me/meetings - 내 모임 목록
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const userId = session.user.id

    // 내가 호스트이거나 참여한 모임
    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { hostId: userId },
          {
            participants: {
              some: {
                userId,
                status: {
                  not: 'CANCELLED',
                },
              },
            },
          },
        ],
      },
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

    return NextResponse.json(meetings)
  } catch (error) {
    console.error('Failed to fetch user meetings:', error)
    return NextResponse.json(
      { message: '모임 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
