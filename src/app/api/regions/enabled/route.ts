import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllRegionNames } from '@/data/regions'

// GET /api/regions/enabled - 이용 가능한 동네 이름 목록 반환
export async function GET() {
  try {
    const allRegionNames = getAllRegionNames()

    // disabled된 동네만 조회 (DB에 없으면 기본 enabled)
    const disabledSettings: { region: string }[] =
      await (prisma as any).regionSetting.findMany({
        where: { enabled: false },
        select: { region: true },
      })
    const disabledSet = new Set(disabledSettings.map((s) => s.region))

    const enabledRegions = allRegionNames.filter((name) => !disabledSet.has(name))

    return NextResponse.json(enabledRegions)
  } catch (error) {
    console.error('Failed to fetch enabled regions:', error)
    return NextResponse.json(
      { message: '이용 가능한 동네를 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
