'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/common'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.region) {
      router.push('/home')
    } else if (status === 'authenticated' && !session?.user?.region) {
      router.push('/onboarding')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-white">
        <div className="animate-pulse text-2xl font-bold text-primary">경도</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-white to-accent/10 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* 달리는 사람 아이콘 */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-5xl">🏃</span>
          </div>
          <div className="absolute -right-2 -top-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-lg">🚔</span>
          </div>
        </div>

        {/* 로고 */}
        <h1 className="text-5xl font-bold text-secondary mb-4 animate-fade-in">
          경도
        </h1>

        {/* 슬로건 */}
        <p className="text-xl text-gray-600 mb-2 text-center">
          어른들의 경찰과 도둑
        </p>
        <p className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          &ldquo;회사 빼고 친구 만드는 법&rdquo;
        </p>

        {/* 설명 */}
        <div className="max-w-sm text-center mb-12">
          <p className="text-gray-500 leading-relaxed">
            게임으로 시작해서 신뢰로 연결되는
            <br />
            동네 친구를 만나보세요
          </p>
        </div>

        {/* CTA 버튼 */}
        <Link href="/login" className="w-full max-w-sm">
          <Button fullWidth size="lg" className="mb-4">
            내 동네 설정하기
          </Button>
        </Link>

        {/* 부가 정보 */}
        <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span>🎮</span>
            <span>다양한 게임</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>동네 친구</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span>레벨 시스템</span>
          </div>
        </div>
      </div>

      {/* 하단 */}
      <div className="pb-8 text-center">
        <Link href="/login" className="text-sm text-gray-400 hover:text-primary">
          이미 회원이신가요? 로그인
        </Link>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}
