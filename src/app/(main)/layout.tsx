'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { BottomNav, PushNotificationPrompt } from '@/components/common'

// 비로그인 접근 허용 경로
const PUBLIC_PATHS = ['/home']

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))

  useEffect(() => {
    // 공개 경로가 아닌 경우에만 로그인 체크
    if (!isPublicPath && status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && !session?.user?.region) {
      router.push('/onboarding')
    }
  }, [session, status, router, isPublicPath])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // 공개 경로가 아니고 비로그인 상태면 렌더링하지 않음
  if (!isPublicPath && status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {children}
      <BottomNav />
      {status === 'authenticated' && <PushNotificationPrompt />}
    </div>
  )
}
