import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 관리자 이메일 목록
const ADMIN_EMAILS = ['miniface.ai@gmail.com', process.env.ADMIN_EMAIL].filter(Boolean)

const isAdmin = (email?: string | null) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}

// GET /api/announcements/[id] - 공지사항 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    })

    if (!announcement) {
      return NextResponse.json({ message: '공지사항을 찾을 수 없습니다' }, { status: 404 })
    }

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Failed to fetch announcement:', error)
    return NextResponse.json(
      { message: '공지사항을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// PUT /api/announcements/[id] - 공지사항 수정 (관리자만)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, content, isPublished, isPinned } = body

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isPinned !== undefined && { isPinned }),
      },
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error('Failed to update announcement:', error)
    return NextResponse.json(
      { message: '공지사항 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/announcements/[id] - 공지사항 삭제 (관리자만)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const { id } = await params

    await prisma.announcement.delete({
      where: { id },
    })

    return NextResponse.json({ message: '공지사항이 삭제되었습니다' })
  } catch (error) {
    console.error('Failed to delete announcement:', error)
    return NextResponse.json(
      { message: '공지사항 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
