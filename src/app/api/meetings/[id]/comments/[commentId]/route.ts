import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/meetings/[id]/comments/[commentId] - 댓글 상단 고정/해제 (호스트만)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id: meetingId, commentId } = await params

    // 모임 정보 확인 (호스트 여부)
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { hostId: true },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    if (meeting.hostId !== session.user.id) {
      return NextResponse.json({ message: '호스트만 글을 고정할 수 있습니다' }, { status: 403 })
    }

    // 댓글 존재 확인
    const comment = await prisma.meetingComment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return NextResponse.json({ message: '댓글을 찾을 수 없습니다' }, { status: 404 })
    }

    // 고정 상태 토글
    const updatedComment = await prisma.meetingComment.update({
      where: { id: commentId },
      data: { isPinned: !comment.isPinned },
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

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Failed to toggle pin:', error)
    return NextResponse.json(
      { message: '고정 상태 변경에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/meetings/[id]/comments/[commentId] - 댓글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { commentId } = await params

    // 댓글 존재 및 작성자 확인
    const comment = await prisma.meetingComment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return NextResponse.json({ message: '댓글을 찾을 수 없습니다' }, { status: 404 })
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json({ message: '본인의 댓글만 삭제할 수 있습니다' }, { status: 403 })
    }

    await prisma.meetingComment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ message: '삭제되었습니다' })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { message: '댓글 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
