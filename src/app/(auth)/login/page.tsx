'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/common'

export default function LoginPage() {
  const handleKakaoLogin = () => {
    signIn('kakao', { callbackUrl: '/onboarding' })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상단 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
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
