import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 관리자 이메일 목록
const ADMIN_EMAILS = ['admin@gyeongdo.com', process.env.ADMIN_EMAIL].filter(Boolean)

const isAdmin = (email?: string | null) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}

// GET /api/announcements - 공지사항 목록 조회 (공개된 것만)
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Failed to fetch announcements:', error)
    return NextResponse.json(
      { message: '공지사항을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// POST /api/announcements - 공지사항 작성 (관리자만)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, isPublished = true, isPinned = false } = body

    if (!title || !content) {
      return NextResponse.json({ message: '제목과 내용을 입력해주세요' }, { status: 400 })
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        isPublished,
        isPinned,
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error('Failed to create announcement:', error)
    return NextResponse.json(
      { message: '공지사항 작성에 실패했습니다' },
      { status: 500 }
    )
  }
}
