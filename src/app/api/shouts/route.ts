import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/shouts - 최근 떠들기 메시지 목록
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    // 최근 1시간 내 떠들기 메시지
    const oneHourAgo = new Date()
    oneHourAgo.setHours(oneHourAgo.getHours() - 1)

    const shouts = await prisma.shout.findMany({
      where: {
        createdAt: {
          gte: oneHourAgo,
        },
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            level: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // 최대 50개
    })

    return NextResponse.json(shouts)
  } catch (error) {
    console.error('Failed to fetch shouts:', error)
    return NextResponse.json(
      { message: '떠들기 메시지를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/shouts - 떠들기 메시지 작성 (하루 1회)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ message: '메시지를 입력해주세요' }, { status: 400 })
    }

    const trimmedMessage = message.trim()

    if (trimmedMessage.length === 0) {
      return NextResponse.json({ message: '메시지를 입력해주세요' }, { status: 400 })
    }

    if (trimmedMessage.length > 50) {
      return NextResponse.json({ message: '메시지는 50자 이내로 작성해주세요' }, { status: 400 })
    }

    // 오늘 이미 작성했는지 확인
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingShout = await prisma.shout.findFirst({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: today,
        },
      },
    })

    if (existingShout) {
      return NextResponse.json(
        { message: '오늘은 이미 떠들기를 사용했어요. 내일 다시 시도해주세요!' },
        { status: 400 }
      )
    }

    // 떠들기 생성
    const shout = await prisma.shout.create({
      data: {
        message: trimmedMessage,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            level: true,
          },
        },
      },
    })

    return NextResponse.json(shout, { status: 201 })
  } catch (error) {
    console.error('Failed to create shout:', error)
    return NextResponse.json(
      { message: '떠들기 작성에 실패했습니다' },
      { status: 500 }
    )
  }
}
