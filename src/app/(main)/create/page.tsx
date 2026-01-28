'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AddressSearch from '@/components/AddressSearch'
import KakaoMap from '@/components/KakaoMap'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import type { GameType, CreateMeetingInput } from '@/types'

const GAME_TYPES: { value: GameType; label: string }[] = [
  { value: 'GYEONGDO', label: '🚔 경찰과 도둑' },
  { value: 'SULRAE', label: '🏃 술래잡기' },
  { value: 'MUGUNGHWA', label: '🌺 무궁화' },
  { value: 'PIGU', label: '🏐 피구' },
  { value: 'OTHER', label: '🎯 기타' },
]

interface PlaceInfo {
  placeName: string
  address: string
  latitude: number
  longitude: number
}

export default function CreateMeetingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showAddressSearch, setShowAddressSearch] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<PlaceInfo | null>(null)

  const [formData, setFormData] = useState({
    gameType: 'GYEONGDO' as GameType,
    title: '',
    description: '',
    meetingDate: '',
    meetingTime: '',
    maxParticipants: 8,
    password: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePlaceSelect = (place: PlaceInfo) => {
    setSelectedPlace(place)
    setShowAddressSearch(false)
  }

  const isValid = formData.title.length >= 2 && formData.meetingDate && formData.meetingTime && selectedPlace

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !session?.user?.region || !selectedPlace) return

    setIsLoading(true)
    try {
      const meetingDateTime = new Date(
        `${formData.meetingDate}T${formData.meetingTime}`
      ).toISOString()

      const input: CreateMeetingInput & { password?: string } = {
        title: formData.title,
        description: formData.description || undefined,
        gameType: formData.gameType,
        meetingDate: meetingDateTime,
        duration: 120,
        region: session.user.region,
        placeName: selectedPlace.placeName,
        address: selectedPlace.address,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        maxParticipants: formData.maxParticipants,
        minLevel: 1,
        password: formData.password || undefined,
      }

      const res = await fetchWithAuth('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (res.ok) {
        const meeting = await res.json()
        router.replace(`/meeting/${meeting.id}?fromCreate=true`)
      } else {
        const error = await res.json()
        alert(error.message || '모임 생성에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to create meeting:', error)
      alert('모임 생성에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">모임 만들기</h1>
        </div>
      </header>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* 게임 종류 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            게임 종류
          </label>
          <select
            name="gameType"
            value={formData.gameType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {GAME_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* 모임 제목 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            모임 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="예: 성수동 경찰과 도둑 같이 해요!"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 날짜 & 시간 */}
        <div className="grid grid-cols-2 gap-3 overflow-hidden">
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              날짜 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="meetingDate"
              value={formData.meetingDate}
              onChange={handleInputChange}
              min={today}
              className="w-full min-w-0 max-w-full px-3 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="meetingTime"
              value={formData.meetingTime}
              onChange={handleInputChange}
              className="w-full min-w-0 max-w-full px-3 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>
        </div>

        {/* 장소 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            장소 <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowAddressSearch(true)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-left focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {selectedPlace ? (
              <span className="text-gray-900">{selectedPlace.placeName}</span>
            ) : (
              <span className="text-gray-400">장소를 검색하세요</span>
            )}
          </button>

          {/* 선택된 장소 정보 및 지도 미리보기 */}
          {selectedPlace && (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-gray-500">{selectedPlace.address}</p>
              <KakaoMap
                latitude={selectedPlace.latitude}
                longitude={selectedPlace.longitude}
                placeName={selectedPlace.placeName}
              />
            </div>
          )}
        </div>

        {/* 모집 인원 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            모집 인원
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, maxParticipants: Math.max(2, prev.maxParticipants - 1) }))}
              className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 active:bg-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-2xl font-bold text-gray-900 w-16 text-center">
              {formData.maxParticipants}명
            </span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, maxParticipants: Math.min(20, prev.maxParticipants + 1) }))}
              className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary active:bg-primary/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* 비밀번호 (선택) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            비밀번호 (선택)
          </label>
          <input
            type="text"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="비공개 모임인 경우 입력"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-gray-400">
            비밀번호를 설정하면 링크 공유 시 비밀번호 입력이 필요합니다
          </p>
        </div>

        {/* 상세 설명 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            상세 설명 (선택)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="모임에 대한 추가 정보를 입력해주세요"
            rows={3}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
            isValid && !isLoading
              ? 'bg-primary text-white active:bg-primary-dark'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {isLoading ? '생성 중...' : '모임 만들기'}
        </button>
      </form>

      {/* 주소 검색 모달 */}
      {showAddressSearch && (
        <AddressSearch
          onSelect={handlePlaceSelect}
          onCancel={() => setShowAddressSearch(false)}
        />
      )}
    </div>
  )
}
