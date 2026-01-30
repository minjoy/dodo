import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 관리자 이메일 목록
const ADMIN_EMAILS = ['miniface.ai@gmail.com', process.env.ADMIN_EMAIL].filter(Boolean)

const isAdmin = (email?: string | null) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}

// GET /api/admin/announcements - 전체 공지사항 목록 조회 (비공개 포함)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const announcements = await prisma.announcement.findMany({
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
