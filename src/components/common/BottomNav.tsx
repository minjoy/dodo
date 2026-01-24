'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/home',
    label: '홈',
    icon: (active: boolean) => (
      <svg
        className={cn('w-6 h-6 transition-colors', active ? 'text-primary' : 'text-gray-400')}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 0 : 2}
          d={active
            ? "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            : "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          }
        />
      </svg>
    ),
  },
  {
    href: '/explore',
    label: '탐색',
    icon: (active: boolean) => (
      <svg
        className={cn('w-6 h-6 transition-colors', active ? 'text-primary' : 'text-gray-400')}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    href: '/create',
    label: '만들기',
    icon: (active: boolean) => (
      <div
        className={cn(
          'w-14 h-14 -mt-6 rounded-2xl flex items-center justify-center shadow-xl transition-all',
          active
            ? 'bg-gradient-to-br from-primary-dark to-primary shadow-primary/40 scale-110'
            : 'bg-gradient-to-br from-primary to-primary-dark shadow-primary/30 hover:shadow-primary/40 hover:scale-105'
        )}
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    ),
    isSpecial: true,
  },
  {
    href: '/chat',
    label: '채팅',
    icon: (active: boolean) => (
      <svg
        className={cn('w-6 h-6 transition-colors', active ? 'text-primary' : 'text-gray-400')}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 0 : 2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    href: '/my',
    label: 'MY',
    icon: (active: boolean) => (
      <svg
        className={cn('w-6 h-6 transition-colors', active ? 'text-primary' : 'text-gray-400')}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={active ? 0 : 2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100/50 safe-bottom z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around h-18 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all',
                item.isSpecial ? '-mt-2' : 'min-w-[60px]',
                isActive && !item.isSpecial && 'bg-primary/5'
              )}
            >
              {item.icon(isActive)}
              {!item.isSpecial && (
                <span
                  className={cn(
                    'text-xs mt-1 font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-gray-400'
                  )}
                >
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
