'use client'

import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/hooks'

const PUSH_PROMPT_DISMISSED_KEY = 'push_prompt_dismissed'

export default function PushNotificationPrompt() {
  const { isSupported, isSubscribed, permission, subscribe } = usePushNotifications()
  const [showPrompt, setShowPrompt] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // 지원하지 않거나, 이미 구독했거나, 이미 거부한 경우 표시 안 함
    if (!isSupported || isSubscribed || permission === 'denied') {
      setShowPrompt(false)
      return
    }

    // 이미 dismiss한 경우 표시 안 함
    const dismissed = localStorage.getItem(PUSH_PROMPT_DISMISSED_KEY)
    if (dismissed) {
      setShowPrompt(false)
      return
    }

    // 약간의 딜레이 후 표시 (페이지 로드 후 바로 띄우지 않음)
    const timer = setTimeout(() => {
      setShowPrompt(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [isSupported, isSubscribed, permission])

  const handleEnable = async () => {
    setIsLoading(true)
    const success = await subscribe()
    setIsLoading(false)

    if (success) {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(PUSH_PROMPT_DISMISSED_KEY, 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 max-w-[968px] mx-auto z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🔔</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm">알림을 켜면 모임 소식을 바로 받아볼 수 있어요!</p>
            <p className="text-xs text-gray-500 mt-0.5">새 모임, 참가 확정, 시작 알림 등</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl font-medium"
          >
            나중에
          </button>
          <button
            onClick={handleEnable}
            disabled={isLoading}
            className="flex-1 py-2 text-sm text-white bg-primary rounded-xl font-medium disabled:opacity-50"
          >
            {isLoading ? '설정 중...' : '알림 켜기'}
          </button>
        </div>
      </div>
    </div>
  )
}
