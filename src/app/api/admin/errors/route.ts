import { NextResponse } from 'next/server'
import { errorLogger } from '@/lib/error-logger'

export async function GET() {
  return NextResponse.json({
    count: errorLogger.getCount(),
    errors: errorLogger.getRecent(50),
  })
}

export async function DELETE() {
  errorLogger.clear()
  return NextResponse.json({ message: 'cleared' })
}
