import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateNickname } from '@/lib/nickname'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const nickname = searchParams.get('nickname')

  if (!nickname) {
    return NextResponse.json({ available: false, error: '닉네임을 입력해주세요' })
  }

  // 유효성 검사
  const validation = validateNickname(nickname)
  if (!validation.isValid) {
    return NextResponse.json({ available: false, error: validation.error })
  }

  // 중복 검사
  const existing = await prisma.user.findFirst({
    where: { nickname: nickname.trim() }
  })

  return NextResponse.json({ available: !existing })
}
