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
      // 현재 경로를 보존하여 로그인 후 복귀할 수 있도록 함
      router.push(`/?redirectTo=${encodeURIComponent(pathname)}`)
    } else if (status === 'authenticated' && !session?.user?.region) {
      // 온보딩 미완료 시 현재 경로를 callbackUrl로 전달
      router.push(`/onboarding?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }, [session, status, router, isPublicPath, pathname])

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
