import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SETTING_KEY = 'region_notice'

// GET /api/region-notice - 동네 한줄 공지사항 조회 (공개)
export async function GET() {
  try {
    const setting = await (prisma as any).siteSetting.findUnique({
      where: { key: SETTING_KEY },
    })

    return NextResponse.json({ notice: setting?.value || '' })
  } catch (error) {
    console.error('Failed to fetch region notice:', error)
    return NextResponse.json({ notice: '' })
  }
}
