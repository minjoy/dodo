'use client'

import { useState, useEffect } from 'react'

interface SplashScreenProps {
  onComplete: () => void
  duration?: number
}

export default function SplashScreen({ onComplete, duration = 3000 }: SplashScreenProps) {
  const [phase, setPhase] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // 애니메이션 단계
    const timer1 = setTimeout(() => setPhase(1), 300)
    const timer2 = setTimeout(() => setPhase(2), 800)
    const timer3 = setTimeout(() => setPhase(3), 1300)
    const timer4 = setTimeout(() => setPhase(4), 1800)

    // 페이드 아웃 시작
    const fadeTimer = setTimeout(() => setFadeOut(true), duration - 500)

    // 완료
    const completeTimer = setTimeout(onComplete, duration)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete, duration])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-secondary transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 떠다니는 이모지들 */}
        <div className="absolute top-[10%] left-[10%] text-4xl animate-float-slow opacity-30">🏃</div>
        <div className="absolute top-[20%] right-[15%] text-3xl animate-float-medium opacity-30">👮</div>
        <div className="absolute top-[60%] left-[8%] text-3xl animate-float-fast opacity-30">🎭</div>
        <div className="absolute top-[70%] right-[10%] text-4xl animate-float-slow opacity-30">🎯</div>
        <div className="absolute top-[40%] left-[85%] text-3xl animate-float-medium opacity-30">🤝</div>
        <div className="absolute top-[85%] left-[30%] text-3xl animate-float-fast opacity-30">🎮</div>
        <div className="absolute top-[15%] left-[50%] text-2xl animate-float-medium opacity-20">⭐</div>
        <div className="absolute top-[50%] left-[20%] text-2xl animate-float-slow opacity-20">✨</div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 로고 아이콘 */}
        <div
          className={`mb-6 transition-all duration-700 ease-out ${
            phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="relative">
            <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-6xl animate-bounce-gentle">🏃</span>
            </div>
            {/* 빛나는 효과 */}
            <div className="absolute inset-0 rounded-full bg-white/10 animate-ping-slow" />
          </div>
        </div>

        {/* 서비스명 */}
        <h1
          className={`text-5xl font-black text-white mb-3 transition-all duration-700 ease-out ${
            phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          경도
        </h1>

        {/* 슬로건 */}
        <p
          className={`text-white/90 text-lg font-medium mb-2 transition-all duration-700 ease-out ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          동네 친구들과 함께하는
        </p>
        <p
          className={`text-white/80 text-base transition-all duration-700 ease-out ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          추억의 게임 모임
        </p>

        {/* 로딩 인디케이터 */}
        <div
          className={`mt-10 flex items-center gap-2 transition-all duration-500 ${
            phase >= 4 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce-dot" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce-dot" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce-dot" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* 하단 텍스트 */}
      <div
        className={`absolute bottom-12 text-white/50 text-sm transition-all duration-500 ${
          phase >= 4 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        회사 빼고 친구 만드는 법
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 3s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 2s ease-in-out infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s ease-out infinite;
        }
        .animate-bounce-dot {
          animation: bounce-dot 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
