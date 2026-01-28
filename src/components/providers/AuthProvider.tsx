'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import SplashScreen from '@/components/SplashScreen'

interface AuthProviderProps {
  children: ReactNode
}

function AppContent({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const pathname = usePathname()
  const [showSplash, setShowSplash] = useState(true)
  const [hasShownSplash, setHasShownSplash] = useState(false)

  useEffect(() => {
    // 세션 스토리지에서 스플래시 표시 여부 확인
    const splashShown = sessionStorage.getItem('splashShown')
    if (splashShown) {
      setShowSplash(false)
      setHasShownSplash(true)
    }
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    setHasShownSplash(true)
    sessionStorage.setItem('splashShown', 'true')
  }

  // 로그인 페이지에서는 스플래시 표시하지 않음 (에러 메시지 보여줘야 함)
  const isLoginPage = pathname === '/login'

  // 스플래시 표시 조건: 첫 방문이고 로그인 페이지가 아닌 경우
  if (showSplash && !hasShownSplash && !isLoginPage) {
    return <SplashScreen onComplete={handleSplashComplete} duration={3000} />
  }

  return <>{children}</>
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      <AppContent>{children}</AppContent>
    </SessionProvider>
  )
}
