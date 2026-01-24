import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/badges - 전체 뱃지 목록 조회
export async function GET() {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
    })

    return NextResponse.json(badges)
  } catch (error) {
    console.error('Failed to fetch badges:', error)
    return NextResponse.json(
      { message: '뱃지 목록을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}
