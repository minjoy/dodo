import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAILS = ['admin@gyeongdo.com', process.env.ADMIN_EMAIL].filter(Boolean)
const ADMIN_COOKIE_KEY = 'mng_auth_x7k9'
const ADMIN_PASSWORD = 'care'

const isAdmin = (email?: string | null) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}

const isAdminAuthenticated = async () => {
  const session = await getServerSession(authOptions)
  if (session?.user?.email && isAdmin(session.user.email)) {
    return true
  }
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get(ADMIN_COOKIE_KEY)
  if (adminCookie?.value === ADMIN_PASSWORD) {
    return true
  }
  return false
}

const SETTING_KEY = 'region_notice'

// GET /api/admin/region-notice - 동네 한줄 공지사항 조회
export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const setting = await (prisma as any).siteSetting.findUnique({
      where: { key: SETTING_KEY },
    })

    return NextResponse.json({ notice: setting?.value || '' })
  } catch (error) {
    console.error('Failed to fetch region notice:', error)
    return NextResponse.json(
      { message: '공지사항을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/region-notice - 동네 한줄 공지사항 저장
export async function PUT(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const { notice } = await request.json()

    if (typeof notice !== 'string') {
      return NextResponse.json(
        { message: 'notice 값이 필요합니다' },
        { status: 400 }
      )
    }

    const trimmed = notice.trim()

    if (trimmed === '') {
      // 빈 값이면 삭제
      await (prisma as any).siteSetting.deleteMany({
        where: { key: SETTING_KEY },
      })
    } else {
      // upsert
      await (prisma as any).siteSetting.upsert({
        where: { key: SETTING_KEY },
        update: { value: trimmed },
        create: { key: SETTING_KEY, value: trimmed },
      })
    }

    return NextResponse.json({ notice: trimmed })
  } catch (error) {
    console.error('Failed to update region notice:', error)
    return NextResponse.json(
      { message: '공지사항 저장에 실패했습니다' },
      { status: 500 }
    )
  }
}
