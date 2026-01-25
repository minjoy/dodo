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
  { name: '서울숲', emoji: '🌲' },
  { name: '압구정', emoji: '✨' },
  { name: '선릉', emoji: '🏢' },
  { name: '신림', emoji: '📚' },
  { name: '왕십리', emoji: '🚇' },
]

export default function RegionChangePage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [selectedRegion, setSelectedRegion] = useState(session?.user?.region || '')
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleRegionChange = async () => {
    if (!selectedRegion) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: selectedRegion }),
      })

      if (res.ok) {
        await update({ region: selectedRegion })
        setShowToast(true)
        setTimeout(() => {
          setShowToast(false)
          router.back()
        }, 1500)
      } else {
        const error = await res.json()
        alert(error.message || '동네 변경에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to change region:', error)
      alert('동네 변경에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const currentRegion = session?.user?.region

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-bold text-gray-900">동네 변경</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* 현재 동네 */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">현재 동네</p>
              <p className="font-bold text-lg text-gray-900">{currentRegion || '설정되지 않음'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 동네 선택 */}
      <div className="px-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">동네 선택</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_REGIONS.map((region) => (
              <button
                key={region.name}
                onClick={() => setSelectedRegion(region.name)}
                disabled={isLoading}
                className={`flex items-center gap-2 p-4 rounded-xl text-left transition-all ${
                  selectedRegion === region.name
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : region.name === currentRegion
                      ? 'bg-green-50 text-green-700 border-2 border-green-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{region.emoji}</span>
                <span className="font-medium">{region.name}</span>
                {region.name === currentRegion && selectedRegion !== region.name && (
                  <span className="ml-auto text-xs text-green-600">현재</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-semibold text-amber-800">동네 변경 안내</p>
              <p className="text-sm text-amber-700 mt-1">
                동네를 변경하면 해당 지역의 모임만 볼 수 있어요.
                <br />
                언제든지 다시 변경할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-[1000px] mx-auto bg-white border-t border-gray-100 px-4 pt-4 pb-8 safe-bottom">
          <button
            onClick={handleRegionChange}
            disabled={!selectedRegion || selectedRegion === currentRegion || isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
              selectedRegion && selectedRegion !== currentRegion && !isLoading
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                변경 중...
              </span>
            ) : selectedRegion === currentRegion ? (
              '현재 동네입니다'
            ) : (
              `${selectedRegion || '동네 선택'}으로 변경`
            )}
          </button>
        </div>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span className="font-medium">동네가 변경되었습니다!</span>
          </div>
        </div>
      )}
    </div>
  )
}
