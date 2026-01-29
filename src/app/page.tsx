'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-5xl mb-4">🏃</div>
          <div className="text-2xl font-bold text-gray-900">경도</div>
        </div>
      </div>
    }>
      <LandingContent />
    </Suspense>
  )
}

function LandingContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.region) {
      router.push('/home')
    } else if (status === 'authenticated' && !session?.user?.region) {
      router.push('/onboarding')
    }
  }, [session, status, router])

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-5xl mb-4">🏃</div>
          <div className="text-2xl font-bold text-gray-900">경도</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative pb-28">
      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* 로고 */}
        <div className="mb-8">
          <div className="text-7xl mb-4">🏃</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">경도</h1>
          <p className="text-primary font-medium">어른들의 경찰과 도둑</p>
        </div>

        {/* 설명 */}
        <p className="text-gray-500 text-lg leading-relaxed mb-12 max-w-xs">
          동네에서 함께 뛰어놀 친구를 찾아보세요
        </p>

        {/* 특징 */}
        <div className="flex gap-6 mb-12">
          <div className="text-center">
            <div className="text-2xl mb-1">🎮</div>
            <div className="text-sm text-gray-500">다양한 게임</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📍</div>
            <div className="text-sm text-gray-500">동네 기반</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-sm text-gray-500">새로운 친구</div>
          </div>
        </div>
      </main>

      {/* 하단 버튼 */}
      <div className="px-6 pb-10 safe-bottom">
        <button
          onClick={() => {
            const callbackUrl = redirectTo
              ? `/onboarding?callbackUrl=${encodeURIComponent(redirectTo)}`
              : '/onboarding'
            signIn('kakao', { callbackUrl })
          }}
          className="w-full bg-[#FEE500] text-[#191919] font-bold py-4 rounded-xl flex items-center justify-center gap-3 active:bg-[#FDD835] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 3C6.477 3 2 6.463 2 10.691c0 2.726 1.818 5.122 4.546 6.485-.145.522-.93 3.36-.964 3.594 0 0-.02.163.086.225.106.062.23.014.23.014.303-.042 3.506-2.296 4.06-2.685.672.096 1.364.147 2.042.147 5.523 0 10-3.463 10-7.78C22 6.463 17.523 3 12 3Z"
              fill="#191919"
            />
          </svg>
          카카오로 시작하기
        </button>

        <p className="text-center text-gray-400 text-xs mt-4">
          가입 시{' '}
          <Link href="/terms" className="underline">이용약관</Link>
          {' '}및{' '}
          <Link href="/privacy" className="underline">개인정보처리방침</Link>
          에 동의하게 됩니다
        </p>
      </div>

      {/* 푸터 - 절대 위치로 하단 고정 */}
      <footer className="absolute bottom-0 left-0 right-0 px-6 py-6 text-center text-xs text-gray-400 leading-relaxed bg-white">
        <p>상호명: 와하공방 | 대표자: 김수연</p>
        <p>사업장 소재지: 서울특별시 성북구 오패산로4길 42 2층 와하공방</p>
        <p>통신판매업번호: 2024-서울성북-1373</p>
      </footer>
    </div>
  )
}
