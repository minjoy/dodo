'use client'

import { useState, useEffect, useCallback } from 'react'

declare global {
  interface Window {
    kakao: any
  }
}

interface Place {
  id: string
  place_name: string
  address_name: string
  road_address_name?: string
  x: string // longitude
  y: string // latitude
}

interface AddressSearchProps {
  onSelect: (place: { placeName: string; address: string; latitude: number; longitude: number }) => void
  onCancel: () => void
}

export default function AddressSearch({ onSelect, onCancel }: AddressSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // 카카오맵 SDK 로드
  useEffect(() => {
    const loadKakaoSDK = () => {
      // 이미 로드된 경우
      if (window.kakao?.maps?.services) {
        setIsLoaded(true)
        return
      }

      // 스크립트가 이미 있지만 아직 로드 안된 경우
      if (window.kakao?.maps) {
        window.kakao.maps.load(() => {
          setIsLoaded(true)
        })
        return
      }

      // 기존 스크립트 확인
      const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')
      if (existingScript) {
        // 스크립트는 있지만 아직 로드 안됨 - 대기
        const checkLoaded = setInterval(() => {
          if (window.kakao?.maps) {
            clearInterval(checkLoaded)
            window.kakao.maps.load(() => {
              setIsLoaded(true)
            })
          }
        }, 100)
        return
      }

      // 새 스크립트 추가
      const script = document.createElement('script')
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`
      script.async = true
      script.onload = () => {
        window.kakao.maps.load(() => {
          setIsLoaded(true)
        })
      }
      script.onerror = () => {
        console.error('카카오맵 SDK 로드 실패')
      }
      document.head.appendChild(script)
    }

    loadKakaoSDK()
  }, [])

  // 장소 검색
  const searchPlaces = useCallback((keyword: string) => {
    if (!isLoaded || !keyword.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    const ps = new window.kakao.maps.services.Places()

    ps.keywordSearch(keyword, (data: Place[], status: string) => {
      setIsSearching(false)
      if (status === window.kakao.maps.services.Status.OK) {
        setResults(data.slice(0, 10))
      } else {
        setResults([])
      }
    })
  }, [isLoaded])

  // 디바운스 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchPlaces(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchPlaces])

  const handleSelect = (place: Place) => {
    onSelect({
      placeName: place.place_name,
      address: place.road_address_name || place.address_name,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button
          onClick={onCancel}
          className="p-2 -ml-2"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">장소 검색</h1>
      </header>

      {/* 검색 입력 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchPlaces(query)}
              placeholder="장소명 또는 주소로 검색"
              autoFocus
              className="w-full pl-12 pr-10 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => searchPlaces(query)}
            disabled={!isLoaded || query.length < 2}
            className="px-4 py-3 bg-primary text-white font-semibold rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            검색
          </button>
        </div>
        {!isLoaded && (
          <p className="text-xs text-orange-500 mt-2">지도 SDK 로딩 중...</p>
        )}
      </div>

      {/* 검색 결과 */}
      <div className="flex-1 overflow-y-auto">
        {isSearching ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <ul>
            {results.map((place) => (
              <li key={place.id}>
                <button
                  onClick={() => handleSelect(place)}
                  className="w-full px-4 py-4 text-left border-b border-gray-50 active:bg-gray-50"
                >
                  <p className="font-medium text-gray-900">{place.place_name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {place.road_address_name || place.address_name}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : query.length >= 2 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>장소를 검색해주세요</p>
          </div>
        )}
      </div>
    </div>
  )
}
