'use client'

import Image from 'next/image'

interface UserDisplayProps {
  user: {
    id: string
    nickname: string
    profileImage?: string | null
    level: number
    representativeBadge?: { id: string; name: string; icon: string } | null
  }
  size?: 'sm' | 'md' | 'lg'
  showLevel?: boolean
  showBadge?: boolean
  className?: string
  onClick?: () => void
  children?: React.ReactNode
  suffix?: React.ReactNode
}

const sizeConfig = {
  sm: { avatar: 'w-8 h-8', badge: 'w-4 h-4 text-xs', text: 'text-sm' },
  md: { avatar: 'w-10 h-10', badge: 'w-5 h-5 text-xs', text: 'text-base' },
  lg: { avatar: 'w-12 h-12', badge: 'w-6 h-6 text-sm', text: 'text-lg' },
}

export default function UserDisplay({
  user,
  size = 'md',
  showLevel = true,
  showBadge = true,
  className = '',
  onClick,
  children,
  suffix,
}: UserDisplayProps) {
  const config = sizeConfig[size]

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 프로필 이미지 + 대표 뱃지 */}
      <div className="relative flex-shrink-0">
        <div className={`${config.avatar} rounded-full overflow-hidden bg-gray-200`}>
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.nickname}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </div>
        {/* 대표 뱃지 (프로필 이미지 우하단) */}
        {showBadge && user.representativeBadge && (
          <div className={`absolute -bottom-0.5 -right-0.5 ${config.badge} bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm`}>
            <span>{user.representativeBadge.icon}</span>
          </div>
        )}
      </div>

      {/* 닉네임 + 레벨 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold text-gray-900 truncate ${config.text}`}>
            {user.nickname}
          </span>
          {showLevel && (
            <span className="text-xs text-gray-400 flex-shrink-0">Lv.{user.level}</span>
          )}
          {suffix}
        </div>
        {children}
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left w-full">
        {content}
      </button>
    )
  }

  return content
}
