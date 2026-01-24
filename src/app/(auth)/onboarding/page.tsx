'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const POPULAR_REGIONS = [
  { name: '성수동', emoji: '🏭' },
  { name: '홍대', emoji: '🎸' },
  { name: '강남', emoji: '💼' },
  { name: '신촌', emoji: '🎓' },
  { name: '이태원', emoji: '🌍' },
  { name: '건대', emoji: '🎪' },
  { name: '잠실', emoji: '🏟️' },
  { name: '여의도', emoji: '🌆' },
  { name: '망원동', emoji: '☕' },
  { name: '연남동', emoji: '🌳' },
  { name: '합정', emoji: '🎨' },
  { name: '압구정', emoji: '✨' },
]

export default function OnboardingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState('')
  const [customRegion, setCustomRegion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region)
    setCustomRegion('')
  }

  const handleCustomRegionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomRegion(e.target.value)
    setSelectedRegion('')
  }

  const handleSubmit = async () => {
    const region = selectedRegion || customRegion
    if (!region) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region }),
      })

      if (res.ok) {
        await update({ region })
        router.push('/home')
      }
    } catch (error) {
      console.error('Failed to update region:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentRegion = selectedRegion || customRegion

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* 헤더 */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📍</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Step 1 of 1</p>
            <h1 className="text-xl font-bold text-gray-900">동네 설정</h1>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 mb-6">
          <p className="text-gray-700">
            <span className="font-semibold text-primary">{session?.user?.name || '회원'}</span>님, 반가워요! 👋
          </p>
          <p className="text-gray-600 text-sm mt-1">
            활동할 동네를 설정하면 근처 모임을 찾아드릴게요
          </p>
        </div>
      </div>

      {/* 검색 입력 */}
      <div className="px-6 mb-6">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="동네 이름을 검색하세요"
            value={customRegion}
            onChange={handleCustomRegionChange}
            className="w-full pl-16 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* 인기 동네 */}
      <div className="px-6 flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🔥</span>
          <h2 className="text-sm font-bold text-gray-900">인기 동네</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {POPULAR_REGIONS.map((region) => (
            <button
              key={region.name}
              onClick={() => handleRegionSelect(region.name)}
              className={`flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${
                selectedRegion === region.name
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                  : 'bg-white border-2 border-gray-100 text-gray-700 hover:border-primary/30 hover:bg-primary/5'
              }`}
            >
              <span className="text-2xl">{region.emoji}</span>
              <span className="font-semibold">{region.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 동네 & 버튼 */}
      <div className="p-6 bg-white border-t border-gray-100 safe-bottom">
        {currentRegion && (
          <div className="flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500">선택한 동네</p>
              <p className="font-bold text-gray-900">{currentRegion}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!currentRegion || isLoading}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            currentRegion && !isLoading
              ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              설정 중...
            </>
          ) : (
            <>
              시작하기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
