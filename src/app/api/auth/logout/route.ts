import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()

  // next-auth 관련 쿠키 삭제
  const cookiesToDelete = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.csrf-token',
    '__Secure-next-auth.csrf-token',
  ]

  cookiesToDelete.forEach((cookieName) => {
    cookieStore.delete(cookieName)
  })

  return NextResponse.json({ success: true })
}
