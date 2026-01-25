import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/meetings/[id]/comments/[commentId] - 댓글 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { commentId } = await params
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

    // 댓글 존재 및 작성자 확인
    const comment = await prisma.meetingComment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      return NextResponse.json({ message: '댓글을 찾을 수 없습니다' }, { status: 404 })
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json({ message: '본인의 댓글만 수정할 수 있습니다' }, { status: 403 })
    }

    const updatedComment = await prisma.meetingComment.update({
      where: { id: commentId },
      data: { content: trimmedContent },
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
    console.error('Failed to update comment:', error)
    return NextResponse.json(
      { message: '댓글 수정에 실패했습니다' },
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
