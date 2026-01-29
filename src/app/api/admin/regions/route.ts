import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { cookies } from 'next/headers'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAllRegionNames } from '@/data/regions'

// 관리자 이메일 목록
const ADMIN_EMAILS = ['admin@gyeongdo.com', process.env.ADMIN_EMAIL].filter(Boolean)

const ADMIN_COOKIE_KEY = 'mng_auth_x7k9'
const ADMIN_PASSWORD = 'care'

const isAdmin = (email?: string | null) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}

const isAdminAuthenticated = async () => {
  // NextAuth 세션 확인
  const session = await getServerSession(authOptions)
  if (session?.user?.email && isAdmin(session.user.email)) {
    return true
  }
  // 관리자 쿠키 확인
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get(ADMIN_COOKIE_KEY)
  if (adminCookie?.value === ADMIN_PASSWORD) {
    return true
  }
  return false
}

// GET /api/admin/regions - 전체 동네 설정 목록 조회
export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const allRegionNames = getAllRegionNames()

    // DB에 저장된 설정 조회
    const settings: { region: string; enabled: boolean }[] =
      await (prisma as any).regionSetting.findMany()
    const settingsMap = new Map(settings.map((s) => [s.region, s]))

    // 전체 동네 목록에 대해 설정 반환 (DB에 없으면 기본 enabled: true)
    const regions = allRegionNames.map((name) => {
      const setting = settingsMap.get(name)
      return {
        region: name,
        enabled: setting ? setting.enabled : true,
      }
    })

    return NextResponse.json(regions)
  } catch (error) {
    console.error('Failed to fetch region settings:', error)
    return NextResponse.json(
      { message: '동네 설정을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/regions - 동네 on/off 토글
export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const { region, enabled } = await request.json()

    if (!region || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { message: 'region과 enabled 값이 필요합니다' },
        { status: 400 }
      )
    }

    // 유효한 동네인지 확인
    const allRegionNames = getAllRegionNames()
    if (!allRegionNames.includes(region)) {
      return NextResponse.json(
        { message: '유효하지 않은 동네입니다' },
        { status: 400 }
      )
    }

    // upsert: 있으면 업데이트, 없으면 생성
    const setting = await (prisma as any).regionSetting.upsert({
      where: { region },
      update: { enabled },
      create: { region, enabled },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Failed to update region setting:', error)
    return NextResponse.json(
      { message: '동네 설정 변경에 실패했습니다' },
      { status: 500 }
    )
  }
}
