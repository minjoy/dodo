'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleKakaoLogin = () => {
    signIn('kakao', { callbackUrl: '/onboarding' })
  }

  const getErrorMessage = () => {
    switch (error) {
      case 'banned':
        return {
          title: '이용이 제한된 계정입니다',
          message: '영구 정지된 계정으로 서비스를 이용할 수 없습니다.',
          icon: '🚫',
        }
      case 'suspended':
        return {
          title: '계정이 정지되었습니다',
          message: '신고 누적으로 인해 계정이 정지되었습니다. 관리자에게 문의해주세요.',
          icon: '⚠️',
        }
      case 'underage':
        return {
          title: '가입이 제한됩니다',
          message: '경도는 20세 이상 성인만 이용할 수 있는 서비스입니다.',
          icon: '🔞',
        }
      default:
        return null
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* 에러 메시지 */}
        {errorInfo && (
          <div className="w-full max-w-sm mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{errorInfo.icon}</span>
              <div>
                <h3 className="font-bold text-red-800 mb-1">{errorInfo.title}</h3>
                <p className="text-sm text-red-600">{errorInfo.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* 로고 */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-4xl">🏃</span>
          </div>
          <h1 className="text-3xl font-bold text-secondary text-center">경도</h1>
        </div>

        {/* 설명 */}
        <div className="text-center mb-12">
          <p className="text-gray-600 mb-2">동네 친구들과 함께하는</p>
          <p className="text-gray-600">추억의 게임 모임</p>
        </div>

        {/* 카카오 로그인 버튼 */}
        <div className="w-full max-w-sm">
          <button
            onClick={handleKakaoLogin}
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
            카카오 계정으로 시작하기
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            로그인 시 서비스 이용약관 및 개인정보처리방침에 동의합니다
          </p>
        </div>
      </div>

      {/* 하단 장식 */}
      <div className="h-32 bg-gradient-to-t from-primary/5 to-transparent" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
