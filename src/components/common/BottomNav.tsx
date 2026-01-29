'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import LoginRequiredModal from './LoginRequiredModal'

const navItems = [
  {
    href: '/home',
    label: '홈',
    requiresAuth: false,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
  },
  {
    href: '/explore',
    label: '유저찾기',
    requiresAuth: true,
    authMessage: '유저를 찾으려면 로그인이 필요합니다',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    ),
  },
  {
    href: '/create',
    label: '모임만들기',
    requiresAuth: true,
    authMessage: '모임을 만들려면 로그인이 필요합니다',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    ),
  },
  {
    href: '/ranking',
    label: '동네랭킹',
    requiresAuth: true,
    authMessage: '랭킹을 보려면 로그인이 필요합니다',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    ),
  },
  {
    href: '/my',
    label: 'MY',
    requiresAuth: true,
    authMessage: '마이페이지를 이용하려면 로그인이 필요합니다',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { status } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const [hasPlayingMeetings, setHasPlayingMeetings] = useState(false)

  const isAuthenticated = status === 'authenticated'

  useEffect(() => {
    if (!isAuthenticated) return

    const checkPlayingMeetings = async () => {
      try {
        const res = await fetch('/api/users/me/meetings')
        if (res.ok) {
          const meetings = await res.json()
          const playing = meetings.some((m: { status: string }) => m.status === 'PLAYING')
          setHasPlayingMeetings(playing)
        }
      } catch {
        // ignore
      }
    }

    checkPlayingMeetings()
    const interval = setInterval(checkPlayingMeetings, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault()
      setLoginMessage(item.authMessage || '로그인이 필요합니다')
      setShowLoginModal(true)
      return
    }
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-[1000px] mx-auto bg-white border-t border-gray-200 safe-bottom">
          <div className="flex items-stretch h-16">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const isMyTab = item.href === '/my'
            const showLiveIndicator = isMyTab && hasPlayingMeetings
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(item, e)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 relative ${
                  showLiveIndicator ? 'z-10' : ''
                }`}
              >
                <div className="relative">
                  {showLiveIndicator && (
                    <>
                      {/* 바깥쪽 펄스 링 */}
                      <span className="absolute inset-0 -m-2 rounded-full bg-red-400/30 animate-pulse-ring" />
                      {/* 글로우 효과 */}
                      <span className="absolute inset-0 -m-1 rounded-full animate-nav-glow" />
                    </>
                  )}
                  <svg
                    className={`w-6 h-6 relative ${
                      showLiveIndicator
                        ? 'text-indigo-500 drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]'
                        : isActive
                          ? 'text-primary'
                          : 'text-gray-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {item.icon}
                  </svg>
                  {showLiveIndicator && (
                    <span className="absolute -top-1 -right-1.5 flex items-center justify-center">
                      <span className="absolute w-4 h-4 rounded-full bg-red-400 animate-nav-ping" />
                      <span className="relative w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    </span>
                  )}
                </div>
                <span className={`text-xs ${
                  showLiveIndicator
                    ? 'text-indigo-600 font-bold'
                    : isActive
                      ? 'text-primary font-semibold'
                      : 'text-gray-400'
                }`}>
                  {showLiveIndicator ? 'LIVE' : item.label}
                </span>
              </Link>
            )
          })}
          </div>
        </div>
      </nav>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={loginMessage}
      />
    </>
  )
}
