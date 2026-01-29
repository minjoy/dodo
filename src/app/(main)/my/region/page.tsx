'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import { getAllRegions, searchRegions, type RegionData } from '@/data/regions'

export default function RegionChangePage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [selectedRegion, setSelectedRegion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [regionSearch, setRegionSearch] = useState('')
  const [enabledRegionNames, setEnabledRegionNames] = useState<Set<string> | null>(null)

  // 이용 가능한 동네 목록 조회
  useEffect(() => {
    fetch('/api/regions/enabled')
      .then((res) => res.json())
      .then((data: string[]) => setEnabledRegionNames(new Set(data)))
      .catch(() => setEnabledRegionNames(null))
  }, [])

  const filteredRegions = useMemo(() => {
    let regions: RegionData[]
    if (!regionSearch.trim()) {
      regions = getAllRegions()
    } else {
      regions = searchRegions(regionSearch)
    }
    // 이용 가능한 동네만 필터링
    if (enabledRegionNames) {
      regions = regions.filter((r) => enabledRegionNames.has(r.name))
    }
    return regions
  }, [regionSearch, enabledRegionNames])

  const popularRegions = useMemo(() => filteredRegions.filter((r) => r.popular), [filteredRegions])
  const otherRegions = useMemo(() => filteredRegions.filter((r) => !r.popular), [filteredRegions])

  const handleRegionChange = async () => {
    if (!selectedRegion) return

    setIsLoading(true)
    try {
      const res = await fetchWithAuth('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region: selectedRegion }),
      })

      if (res.ok) {
        const scrollY = window.scrollY
        await update({ region: selectedRegion })
        window.scrollTo(0, scrollY)
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
  const isChanged = selectedRegion && selectedRegion !== currentRegion

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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

      {/* 검색 */}
      <div className="px-4 mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={regionSearch}
            onChange={(e) => setRegionSearch(e.target.value)}
            placeholder="동네 이름 또는 구 이름으로 검색"
            className="w-full pl-10 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
          />
          {regionSearch && (
            <button
              onClick={() => setRegionSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 서울 지역 선택 */}
      <div className="px-4">
        {filteredRegions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p className="font-medium">검색 결과가 없어요</p>
            <p className="text-sm mt-1">다른 이름으로 검색해보세요</p>
          </div>
        ) : (
          <>
            {/* 인기 지역 */}
            {popularRegions.length > 0 && (
              <>
                {!regionSearch && (
                  <h2 className="text-sm font-semibold text-gray-500 mb-3">인기 지역</h2>
                )}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    {popularRegions.map((region) => (
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
              </>
            )}

            {/* 기타 지역 */}
            {otherRegions.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-gray-500 mb-3 mt-4">
                  {regionSearch ? '검색 결과' : '서울 전체'}
                </h2>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-2 gap-2">
                    {otherRegions.map((region) => (
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
                        <div className="flex flex-col">
                          <span className="font-medium">{region.name}</span>
                          <span className={`text-xs ${
                            selectedRegion === region.name
                              ? 'text-white/70'
                              : region.name === currentRegion
                                ? 'text-green-500'
                                : 'text-gray-400'
                          }`}>{region.district}</span>
                        </div>
                        {region.name === currentRegion && selectedRegion !== region.name && (
                          <span className="ml-auto text-xs text-green-600">현재</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

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
      <div className="px-4 mt-8">
        <button
          onClick={handleRegionChange}
          disabled={!isChanged || isLoading}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            isChanged && !isLoading
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
          ) : !selectedRegion ? (
            '변경할 동네를 선택해주세요'
          ) : selectedRegion === currentRegion ? (
            '현재 동네입니다'
          ) : (
            '저장하기'
          )}
        </button>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">저장되었습니다!</span>
          </div>
        </div>
      )}
    </div>
  )
}
