import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const status = { status: 'ok', timestamp: new Date().toISOString(), db: false }

  try {
    await prisma.$queryRaw`SELECT 1`
    status.db = true
  } catch {
    status.status = 'degraded'
  }

  return NextResponse.json(status, {
    status: status.status === 'ok' ? 200 : 503,
  })
}
