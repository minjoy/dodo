'use client'

import { HTMLAttributes, forwardRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = '', size = 'md', fallback, ...props }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    }

    const imageSizes = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
    }

    const getFallbackText = () => {
      if (fallback) return fallback.charAt(0).toUpperCase()
      if (alt) return alt.charAt(0).toUpperCase()
      return '?'
    }

    // base64 데이터 URL인지 확인
    const isDataUrl = src?.startsWith('data:')

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center font-semibold text-gray-600',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          isDataUrl ? (
            // base64 데이터 URL은 일반 img 태그 사용
            <img
              src={src}
              alt={alt}
              className="object-cover w-full h-full"
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              width={imageSizes[size]}
              height={imageSizes[size]}
              className="object-cover w-full h-full"
            />
          )
        ) : (
          <span>{getFallbackText()}</span>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export default Avatar
