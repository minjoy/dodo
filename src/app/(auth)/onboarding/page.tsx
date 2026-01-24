'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button, Card } from '@/components/common'

const POPULAR_REGIONS = [
  '성수동',
  '홍대',
  '강남',
  '신촌',
  '이태원',
  '건대',
  '잠실',
  '여의도',
  '망원동',
  '연남동',
  '합정',
  '압구정',
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          동네를 설정해주세요
        </h1>
        <p className="text-gray-500">
          {session?.user?.nickname || '회원'}님 근처의 경도 모임을 찾아드릴게요
        </p>
      </div>

      {/* 검색 입력 */}
      <div className="px-6 mb-6">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
          <input
            type="text"
            placeholder="동네 이름을 입력하세요"
            value={customRegion}
            onChange={handleCustomRegionChange}
            className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* 인기 동네 */}
      <div className="px-6 flex-1">
        <h2 className="text-sm font-medium text-gray-500 mb-3">인기 동네</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => handleRegionSelect(region)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedRegion === region
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* 선택된 동네 표시 */}
        {(selectedRegion || customRegion) && (
          <Card className="mt-6 bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">선택된 동네</p>
                <p className="font-semibold text-gray-900">
                  {selectedRegion || customRegion}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="p-6 safe-bottom">
        <Button
          fullWidth
          size="lg"
          disabled={!selectedRegion && !customRegion}
          isLoading={isLoading}
          onClick={handleSubmit}
        >
          시작하기
        </Button>
      </div>
    </div>
  )
}
