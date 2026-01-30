'use client'

import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorInfo = () => {
    switch (error) {
      case 'OAuthCallback':
      case 'OAuthCreateAccount':
      case 'Callback':
        return {
          title: '로그인 처리 중 문제가 발생했습니다',
          message: '잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의해주세요.',
        }
      case 'OAuthSignin':
        return {
          title: '카카오 로그인 연결에 실패했습니다',
          message: '잠시 후 다시 시도해주세요.',
        }
      case 'SessionRequired':
        return {
          title: '로그인이 필요합니다',
          message: '서비스를 이용하려면 로그인해주세요.',
        }
      default:
        return {
          title: '문제가 발생했습니다',
          message: '잠시 후 다시 시도해주세요.',
        }
    }
  }

  const errorInfo = getErrorInfo()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">
        {errorInfo.title}
      </h1>
      <p className="text-gray-500 text-center mb-8">
        {errorInfo.message}
      </p>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => signIn('kakao', { callbackUrl: '/onboarding' })}
          className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] font-semibold py-4 px-6 rounded-xl hover:bg-[#FDD835] transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 4C7.029 4 3 7.163 3 11.097c0 2.513 1.638 4.716 4.106 5.996-.135.486-.87 3.133-.898 3.358 0 0-.018.15.079.207.097.057.211.014.211.014.278-.039 3.221-2.106 3.734-2.463.246.034.498.052.754.052 4.971 0 9-3.163 9-7.097C20 7.163 16.971 4 12 4z"
              fill="#191919"
            />
          </svg>
          다시 로그인하기
        </button>

        <a
          href="/home"
          className="block w-full text-center py-3 text-gray-400 text-sm"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
