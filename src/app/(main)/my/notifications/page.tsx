'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePushNotifications } from '@/hooks'

export default function NotificationSettingsPage() {
  const router = useRouter()
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe } = usePushNotifications()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (isSubscribed) {
        await unsubscribe()
      } else {
        const success = await subscribe()
        if (success) {
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isBlocked = permission === 'denied'
  const isPWA = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">알림 설정</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* 알림 활성화 토글 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">푸시 알림</h3>
                <p className="text-sm text-gray-500">
                  {isSubscribed ? '알림이 활성화되어 있어요' : '알림을 받으려면 켜주세요'}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle}
              disabled={isLoading || !isSupported || isBlocked}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                isSubscribed ? 'bg-primary' : 'bg-gray-300'
              } ${(isLoading || !isSupported || isBlocked) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${
                  isSubscribed ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {showSuccess && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              알림이 활성화되었습니다!
            </div>
          )}

          {isBlocked && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <p className="font-medium mb-1">알림이 차단되어 있어요</p>
              <p className="text-xs">브라우저 설정에서 알림 권한을 허용해주세요.</p>
            </div>
          )}
        </div>

        {/* 알림 종류 안내 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">받을 수 있는 알림</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">⏰</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">오늘의 모임 알림</p>
                <p className="text-sm text-gray-500">매일 오전 10시, 오늘 참여할 모임이 있으면 알려드려요</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">⭐</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">평가 요청 알림</p>
                <p className="text-sm text-gray-500">모임 종료 1시간 후, 함께한 멤버 평가를 잊지 않도록 알려드려요</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎉</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">모임 소식</p>
                <p className="text-sm text-gray-500">새로운 모임, 참가 확정 등 중요한 소식을 알려드려요</p>
              </div>
            </div>
          </div>
        </div>

        {/* iOS 안내 */}
        {!isPWA && /iPhone|iPad/i.test(navigator?.userAgent || '') && (
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📱</span>
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">iPhone에서 알림 받기</h3>
                <p className="text-sm text-blue-700 mb-3">
                  iPhone에서 푸시 알림을 받으려면 앱처럼 설치해주세요.
                </p>
                <ol className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                    <span>Safari 하단의 공유 버튼 탭</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                    <span>&apos;홈 화면에 추가&apos; 선택</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-blue-200 text-blue-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                    <span>홈 화면에서 경도 앱 실행</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* 지원 안내 */}
        {!isSupported && (
          <div className="bg-gray-100 rounded-2xl p-5">
            <p className="text-center text-gray-500 text-sm">
              이 브라우저에서는 푸시 알림을 지원하지 않습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
