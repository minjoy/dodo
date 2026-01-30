'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* 에러 아이콘 */}
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-8 h-8 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      {/* 메시지 */}
      <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">
        문제가 발생했어요
      </h1>
      <p className="text-gray-500 text-center mb-8 leading-relaxed">
        일시적인 오류가 발생했어요.
        <br />
        잠시 후 다시 시도해주세요.
      </p>

      {/* 액션 버튼 */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={reset}
          className="block w-full text-center bg-primary text-white font-semibold py-4 px-6 rounded-xl hover:bg-primary-dark transition-colors shadow-[0_4px_12px_rgba(255,107,53,0.3)] active:scale-[0.98]"
        >
          다시 시도하기
        </button>
        <a
          href="/home"
          className="block w-full text-center py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          홈으로 돌아가기
        </a>
      </div>

      {/* 고객센터 안내 */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-400 mb-1">
          문제가 계속되면 고객센터로 문의해주세요.
        </p>
        <a
          href="mailto:miniface.ai@gmail.com"
          className="text-sm text-primary font-medium hover:underline"
        >
          miniface.ai@gmail.com
        </a>
      </div>
    </div>
  )
}
