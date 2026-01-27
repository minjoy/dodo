'use client'

import { signIn } from 'next-auth/react'

interface LoginRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export default function LoginRequiredModal({
  isOpen,
  onClose,
  message = '이 기능을 사용하려면 로그인이 필요합니다'
}: LoginRequiredModalProps) {
  if (!isOpen) return null

  const handleLogin = () => {
    signIn('kakao', { callbackUrl: '/onboarding' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">로그인이 필요합니다</h3>
          <p className="text-gray-500 text-sm">{message}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] font-semibold py-3 px-4 rounded-xl hover:bg-[#FDD835] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 4C7.029 4 3 7.163 3 11.097c0 2.513 1.638 4.716 4.106 5.996-.135.486-.87 3.133-.898 3.358 0 0-.018.15.079.207.097.057.211.014.211.014.278-.039 3.221-2.106 3.734-2.463.246.034.498.052.754.052 4.971 0 9-3.163 9-7.097C20 7.163 16.971 4 12 4z"
                fill="#191919"
              />
            </svg>
            카카오로 시작하기
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  )
}
