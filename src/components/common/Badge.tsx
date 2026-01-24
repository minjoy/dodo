'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'level'
  level?: 1 | 2 | 3 | 4 | 5
  size?: 'sm' | 'md'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', level, size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full'

    const variants = {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-primary/10 text-primary',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      error: 'bg-red-100 text-red-800',
      level: '',
    }

    const levelStyles: Record<number, string> = {
      1: 'bg-green-100 text-green-700', // 새싹
      2: 'bg-blue-100 text-blue-700', // 동네친구
      3: 'bg-orange-100 text-orange-700', // 단골멤버
      4: 'bg-purple-100 text-purple-700', // 동네대장
      5: 'bg-yellow-100 text-yellow-700', // 전설
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    }

    const levelNames: Record<number, string> = {
      1: 'Lv.1 새싹',
      2: 'Lv.2 동네친구',
      3: 'Lv.3 단골멤버',
      4: 'Lv.4 동네대장',
      5: 'Lv.5 전설',
    }

    if (variant === 'level' && level) {
      return (
        <span
          ref={ref}
          className={cn(baseStyles, levelStyles[level], sizes[size], className)}
          {...props}
        >
          {children || levelNames[level]}
        </span>
      )
    }

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
