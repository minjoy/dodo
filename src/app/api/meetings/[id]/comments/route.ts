import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/meetings/[id]/comments - 모임 게시판 댓글 목록
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id: meetingId } = await params

    const comments = await prisma.meetingComment.findMany({
      where: { meetingId },
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
      orderBy: [
        { isPinned: 'desc' },  // 고정된 글 먼저
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return NextResponse.json(
      { message: '댓글을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/meetings/[id]/comments - 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id: meetingId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ message: '내용을 입력해주세요' }, { status: 400 })
    }

    const trimmedContent = content.trim()
    if (trimmedContent.length === 0) {
      return NextResponse.json({ message: '내용을 입력해주세요' }, { status: 400 })
    }
    if (trimmedContent.length > 200) {
      return NextResponse.json({ message: '200자 이내로 작성해주세요' }, { status: 400 })
    }

    // 모임 존재 확인
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        participants: {
          where: { userId: session.user.id },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    // 참여자 또는 호스트만 작성 가능
    const isHost = meeting.hostId === session.user.id
    const isParticipant = meeting.participants.length > 0

    if (!isHost && !isParticipant) {
      return NextResponse.json({ message: '모임 참여자만 글을 작성할 수 있습니다' }, { status: 403 })
    }

    const comment = await prisma.meetingComment.create({
      data: {
        content: trimmedContent,
        meetingId,
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

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { message: '댓글 작성에 실패했습니다' },
      { status: 500 }
    )
  }
}
