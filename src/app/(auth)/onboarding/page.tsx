'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { validateNickname } from '@/lib/nickname'

const POPULAR_REGIONS = [
  { name: '성수동', emoji: '🏭' },
  { name: '홍대', emoji: '🎸' },
  { name: '강남', emoji: '💼' },
  { name: '신촌', emoji: '🎓' },
  { name: '이태원', emoji: '🌍' },
  { name: '건대', emoji: '🎪' },
  { name: '잠실', emoji: '🏟️' },
  { name: '여의도', emoji: '🌆' },
]

export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [nickname, setNickname] = useState('')
  const [nicknameError, setNicknameError] = useState('')
  const [isCheckingNickname, setIsCheckingNickname] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [customRegion, setCustomRegion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 닉네임 유효성 검사
  useEffect(() => {
    if (!nickname) {
      setNicknameError('')
      return
    }

    const validation = validateNickname(nickname)
    if (!validation.isValid) {
      setNicknameError(validation.error || '')
      return
    }

    // 중복 검사 (디바운스)
    const timer = setTimeout(async () => {
      setIsCheckingNickname(true)
      try {
        const res = await fetch(`/api/users/check-nickname?nickname=${encodeURIComponent(nickname)}`)
        const data = await res.json()
        if (!data.available) {
          setNicknameError('이미 사용 중인 닉네임입니다')
        } else {
          setNicknameError('')
        }
      } catch {
        // 에러 무시
      } finally {
        setIsCheckingNickname(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [nickname])

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    setCustomRegion('')
  }

  const handleSubmit = async () => {
    const region = selectedRegion || customRegion
    if (!region || !nickname || nicknameError) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, nickname }),
      })

      if (res.ok) {
        await update({ region })
        router.push('/home')
      } else {
        const error = await res.json()
        if (error.message?.includes('닉네임')) {
          setNicknameError(error.message)
          setStep(1)
        }
      }
    } catch (error) {
      console.error('Failed to update:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentRegion = selectedRegion || customRegion
  const isNicknameValid = nickname.length >= 2 && !nicknameError && !isCheckingNickname

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="px-4 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{step === 1 ? '👤' : '📍'}</span>
          <h1 className="text-xl font-bold text-gray-900">
            {step === 1 ? '닉네임 설정' : '동네 설정'}
          </h1>
        </div>
        <p className="text-gray-500">
          {step === 1 ? '경도에서 사용할 닉네임을 정해주세요' : '활동할 동네를 선택해주세요'}
        </p>

        {/* Progress */}
        <div className="flex gap-2 mt-4">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
        </div>
      </header>

      {step === 1 ? (
        /* Step 1: 닉네임 설정 */
        <main className="flex-1 px-4 pb-32">
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2~10자, 한글/영문/숫자"
              className={`w-full px-4 py-4 border-2 rounded-xl text-lg focus:outline-none transition-colors ${
                nicknameError
                  ? 'border-red-400 focus:border-red-500'
                  : nickname && !nicknameError
                    ? 'border-green-400 focus:border-green-500'
                    : 'border-gray-200 focus:border-primary'
              }`}
            />
            {nicknameError && (
              <p className="mt-2 text-sm text-red-500">{nicknameError}</p>
            )}
            {nickname && !nicknameError && !isCheckingNickname && (
              <p className="mt-2 text-sm text-green-500">사용 가능한 닉네임입니다</p>
            )}
            {isCheckingNickname && (
              <p className="mt-2 text-sm text-gray-400">확인 중...</p>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">닉네임 규칙</span>
            </p>
            <ul className="mt-2 text-sm text-gray-500 space-y-1">
              <li>• 2~10자 이내</li>
              <li>• 한글, 영문, 숫자만 사용 가능</li>
              <li>• 욕설, 비속어 사용 불가</li>
              <li>• 다른 사용자와 중복 불가</li>
            </ul>
          </div>
        </main>
      ) : (
        /* Step 2: 동네 설정 */
        <main className="flex-1 px-4 pb-32 overflow-y-auto">
          {/* 검색 */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="동네 이름 검색"
              value={customRegion}
              onChange={(e) => {
                setCustomRegion(e.target.value)
                setSelectedRegion('')
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          {/* 인기 동네 */}
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-3">인기 동네</p>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_REGIONS.map((region) => (
                <button
                  key={region.name}
                  onClick={() => handleRegionSelect(region.name)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-left transition-colors ${
                    selectedRegion === region.name
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 text-gray-700 active:bg-gray-100'
                  }`}
                >
                  <span>{region.emoji}</span>
                  <span className="font-medium">{region.name}</span>
                </button>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-bottom">
        {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            disabled={!isNicknameValid}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
              isNicknameValid
                ? 'bg-primary text-white active:bg-primary-dark'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            다음
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-4 rounded-xl font-semibold bg-gray-100 text-gray-600"
            >
              이전
            </button>
            <button
              onClick={handleSubmit}
              disabled={!currentRegion || isLoading}
              className={`flex-[2] py-4 rounded-xl font-semibold text-lg transition-colors ${
                currentRegion && !isLoading
                  ? 'bg-primary text-white active:bg-primary-dark'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isLoading ? '설정 중...' : '시작하기'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
