import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/meetings/code/[code] - 공유 코드로 모임 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const meeting = await prisma.meeting.findUnique({
      where: { shareCode: code.toUpperCase() },
      select: {
        id: true,
        title: true,
        gameType: true,
        meetingDate: true,
        placeName: true,
        maxParticipants: true,
        password: true,
        status: true,
        host: {
          select: {
            nickname: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            participants: {
              where: {
                status: { not: 'CANCELLED' },
              },
            },
          },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json(
        { message: '모임을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 비밀번호는 존재 여부만 반환
    return NextResponse.json({
      ...meeting,
      hasPassword: !!meeting.password,
      password: undefined,
    })
  } catch (error) {
    console.error('Failed to fetch meeting by code:', error)
    return NextResponse.json(
      { message: '모임 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
