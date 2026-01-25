'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePushNotifications } from '@/hooks'

export default function NotificationSettingsPage() {
  const router = useRouter()
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe } = usePushNotifications()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop')
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    // 디바이스 타입 감지
    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setDeviceType('ios')
    } else if (/Android/i.test(ua)) {
      setDeviceType('android')
    } else {
      setDeviceType('desktop')
    }

    // PWA 여부 감지
    setIsPWA(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

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

        {/* 알림 설정 방법 안내 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">알림 받는 방법</h3>

          {/* iPhone/iPad */}
          {deviceType === 'ios' && (
            <div className="space-y-4">
              {!isPWA ? (
                <>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">📱</span>
                      <p className="font-semibold text-blue-900">홈 화면에 앱 설치가 필요해요</p>
                    </div>
                    <p className="text-sm text-blue-700 mb-4">
                      iPhone은 Safari에서 홈 화면에 추가한 후에만 알림을 받을 수 있어요.
                    </p>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
                        <div>
                          <p className="font-medium text-gray-900">Safari 하단의 공유 버튼 탭</p>
                          <p className="text-xs text-gray-500 mt-0.5">네모에서 화살표가 나오는 아이콘</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
                        <div>
                          <p className="font-medium text-gray-900">&apos;홈 화면에 추가&apos; 선택</p>
                          <p className="text-xs text-gray-500 mt-0.5">스크롤해서 찾아주세요</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
                        <div>
                          <p className="font-medium text-gray-900">홈 화면에서 경도 앱 실행</p>
                          <p className="text-xs text-gray-500 mt-0.5">앱처럼 실행되면 알림 설정 가능!</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    iOS 16.4 이상에서 지원됩니다
                  </p>
                </>
              ) : (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">✅</span>
                    <p className="font-semibold text-green-900">앱 설치 완료!</p>
                  </div>
                  <p className="text-sm text-green-700">
                    위의 푸시 알림 토글을 켜면 알림을 받을 수 있어요.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Android */}
          {deviceType === 'android' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🤖</span>
                  <p className="font-semibold text-green-900">Android는 바로 알림 설정 가능!</p>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  위의 푸시 알림 토글을 켜면 바로 알림을 받을 수 있어요.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-2">💡 더 편하게 사용하려면</p>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">1.</span>
                    <span>Chrome 메뉴(⋮) → &apos;홈 화면에 추가&apos;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400">2.</span>
                    <span>앱처럼 바로가기 아이콘이 생겨요!</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Desktop */}
          {deviceType === 'desktop' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💻</span>
                  <p className="font-semibold text-purple-900">PC에서 알림 받기</p>
                </div>
                <p className="text-sm text-purple-700 mb-4">
                  위의 푸시 알림 토글을 켜면 브라우저에서 알림을 받을 수 있어요.
                </p>
                <p className="text-xs text-purple-600">
                  알림이 안 오면 브라우저 설정에서 이 사이트의 알림을 허용해주세요.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 지원 안내 */}
        {!isSupported && (
          <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚠️</span>
              <p className="font-medium text-red-800">알림을 지원하지 않는 환경이에요</p>
            </div>
            <p className="text-sm text-red-600">
              {deviceType === 'ios'
                ? 'Safari에서 홈 화면에 추가한 후 다시 시도해주세요.'
                : '최신 버전의 Chrome, Safari, Edge 브라우저를 사용해주세요.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
