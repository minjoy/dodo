import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/me/roles - 내 역할 히스토리 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const roles = await prisma.gameRole.findMany({
      where: { userId: session.user.id },
      include: {
        meeting: {
          select: {
            title: true,
            gameStartedAt: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(
      roles.map((r) => ({
        meetingTitle: r.meeting.title,
        role: r.role,
        date: r.meeting.gameStartedAt
          ? new Date(r.meeting.gameStartedAt).toLocaleDateString('ko-KR')
          : new Date(r.assignedAt).toLocaleDateString('ko-KR'),
      }))
    )
  } catch (error) {
    console.error('Failed to fetch role history:', error)
    return NextResponse.json(
      { message: '역할 히스토리를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
