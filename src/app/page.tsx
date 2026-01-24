'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-secondary">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏃</div>
          <div className="text-3xl font-bold text-white">경도</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary via-secondary to-gray-900 overflow-hidden relative">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-primary/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-accent/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 py-12">
        {/* 상단 로고 */}
        <div className="text-center mb-8">
          <span className="text-white/60 text-sm font-medium tracking-wider">NEIGHBORHOOD GAME MEETUP</span>
        </div>

        {/* 히어로 섹션 */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* 아이콘 애니메이션 */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary-dark rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-6xl">🏃</span>
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-2xl">🚔</span>
            </div>
            <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">👥</span>
            </div>
          </div>

          {/* 타이틀 */}
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            경도
          </h1>
          <p className="text-primary text-lg font-medium mb-2">
            어른들의 경찰과 도둑
          </p>
          <p className="text-2xl font-bold text-white mb-6">
            회사 빼고 친구 만드는 법
          </p>

          {/* 설명 */}
          <p className="text-white/70 text-base leading-relaxed max-w-xs mb-12">
            동네에서 함께 뛰어놀 친구를 찾고 있나요?<br/>
            게임으로 시작해서 진짜 친구가 되는<br/>
            새로운 사회생활을 경험하세요
          </p>

          {/* 특징 배지 */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
              <span>🎮</span>
              <span className="text-white text-sm font-medium">다양한 게임</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
              <span>📍</span>
              <span className="text-white text-sm font-medium">동네 기반</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
              <span>⭐</span>
              <span className="text-white text-sm font-medium">레벨 시스템</span>
            </div>
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="space-y-4">
          <button
            onClick={() => signIn('kakao', { callbackUrl: '/onboarding' })}
            className="w-full bg-[#FEE500] text-[#191919] font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:bg-[#FDD835] active:scale-[0.98] transition-all"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 3C6.477 3 2 6.463 2 10.691c0 2.726 1.818 5.122 4.546 6.485-.145.522-.93 3.36-.964 3.594 0 0-.02.163.086.225.106.062.23.014.23.014.303-.042 3.506-2.296 4.06-2.685.672.096 1.364.147 2.042.147 5.523 0 10-3.463 10-7.78C22 6.463 17.523 3 12 3Z"
                fill="#191919"
              />
            </svg>
            카카오로 3초만에 시작하기
          </button>

          <p className="text-center text-white/40 text-xs">
            가입 시 <Link href="/terms" className="underline">이용약관</Link> 및 <Link href="/privacy" className="underline">개인정보처리방침</Link>에 동의하게 됩니다
          </p>
        </div>
      </div>
    </div>
  )
}
