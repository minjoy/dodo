'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon: string
}

interface BadgeAcquisitionProps {
  badge: Badge
  onClose: () => void
}

export default function BadgeAcquisition({ badge, onClose }: BadgeAcquisitionProps) {
  const [stage, setStage] = useState<'intro' | 'reveal' | 'show' | 'outro'>('intro')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // 애니메이션 시퀀스
    const timers = [
      setTimeout(() => setStage('reveal'), 500),
      setTimeout(() => setStage('show'), 1500),
      setTimeout(() => setStage('outro'), 4000),
      setTimeout(onClose, 4500),
    ]

    return () => timers.forEach(clearTimeout)
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-500 ${
        stage === 'outro' ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={onClose}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* 파티클 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stage !== 'intro' && (
          <>
            {/* 골드 파티클 */}
            {[...Array(20)].map((_, i) => (
              <div
                key={`gold-${i}`}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-float-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
            {/* 반짝임 효과 */}
            {[...Array(10)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute text-2xl animate-sparkle"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 1.5}s`,
                }}
              >
                ✨
              </div>
            ))}
          </>
        )}
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 text-center px-8">
        {/* 타이틀 */}
        <div
          className={`transition-all duration-700 ${
            stage === 'intro' ? 'opacity-0 -translate-y-8' : 'opacity-100 translate-y-0'
          }`}
        >
          <p className="text-yellow-400 text-lg font-medium mb-2 tracking-widest">
            🎉 NEW BADGE 🎉
          </p>
          <h2 className="text-white text-2xl font-bold mb-8">뱃지를 획득했습니다!</h2>
        </div>

        {/* 뱃지 아이콘 */}
        <div
          className={`transition-all duration-1000 ${
            stage === 'intro'
              ? 'opacity-0 scale-0'
              : stage === 'reveal'
                ? 'opacity-100 scale-150'
                : 'opacity-100 scale-100'
          }`}
        >
          <div className="relative inline-block">
            {/* 글로우 효과 */}
            <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-3xl animate-pulse-slow" />

            {/* 뱃지 컨테이너 */}
            <div className="relative w-40 h-40 mx-auto">
              {/* 회전하는 테두리 */}
              <div className="absolute inset-0 rounded-full border-4 border-yellow-400/50 animate-spin-slow" />
              <div
                className="absolute inset-2 rounded-full border-2 border-yellow-300/30 animate-spin-reverse"
                style={{ animationDuration: '4s' }}
              />

              {/* 뱃지 아이콘 */}
              <div className="absolute inset-4 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/50">
                <span className="text-7xl drop-shadow-lg">{badge.icon}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 뱃지 정보 */}
        <div
          className={`mt-8 transition-all duration-700 delay-500 ${
            stage === 'show' || stage === 'outro'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <h3 className="text-white text-3xl font-bold mb-3">{badge.name}</h3>
          <p className="text-gray-300 text-lg">{badge.description}</p>
        </div>

        {/* 닫기 안내 */}
        <p
          className={`mt-12 text-gray-500 text-sm transition-opacity duration-500 ${
            stage === 'show' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          화면을 탭하여 닫기
        </p>
      </div>

      <style jsx global>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translateY(-100px) scale(1.5);
            opacity: 0.5;
          }
          90% {
            opacity: 0;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        .animate-float-particle {
          animation: float-particle 3s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 6s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>,
    document.body
  )
}

// 뱃지 획득 컨텍스트용 훅
import { createContext, useContext, useCallback, ReactNode } from 'react'

interface BadgeContextType {
  showBadge: (badge: Badge) => void
}

const BadgeContext = createContext<BadgeContextType | null>(null)

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null)

  const showBadge = useCallback((badge: Badge) => {
    setCurrentBadge(badge)
  }, [])

  const hideBadge = useCallback(() => {
    setCurrentBadge(null)
  }, [])

  return (
    <BadgeContext.Provider value={{ showBadge }}>
      {children}
      {currentBadge && (
        <BadgeAcquisition badge={currentBadge} onClose={hideBadge} />
      )}
    </BadgeContext.Provider>
  )
}

export function useBadge() {
  const context = useContext(BadgeContext)
  if (!context) {
    throw new Error('useBadge must be used within a BadgeProvider')
  }
  return context
}
