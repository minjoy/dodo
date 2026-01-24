'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button, Card } from '@/components/common'
import type { GameType, CreateMeetingInput } from '@/types'

const GAME_TYPES: { value: GameType; label: string; emoji: string }[] = [
  { value: 'GYEONGDO', label: '경찰과 도둑', emoji: '🚔' },
  { value: 'SULRAE', label: '술래잡기', emoji: '🏃' },
  { value: 'MUGUNGHWA', label: '무궁화 꽃이 피었습니다', emoji: '🌺' },
  { value: 'PIGU', label: '피구', emoji: '🏐' },
  { value: 'OTHER', label: '기타', emoji: '🎯' },
]

const LEVELS = [
  { value: 1, label: 'Lv.1 새싹' },
  { value: 2, label: 'Lv.2 동네친구' },
  { value: 3, label: 'Lv.3 단골멤버' },
  { value: 4, label: 'Lv.4 동네대장' },
  { value: 5, label: 'Lv.5 전설' },
]

export default function CreateMeetingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    gameType: 'GYEONGDO' as GameType,
    title: '',
    description: '',
    meetingDate: '',
    meetingTime: '',
    duration: 120,
    placeName: '',
    address: '',
    latitude: 37.5665,
    longitude: 126.978,
    maxParticipants: 8,
    minLevel: 1,
  })

  const handleGameTypeSelect = (gameType: GameType) => {
    setFormData((prev) => ({ ...prev, gameType }))
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleParticipantsChange = (delta: number) => {
    setFormData((prev) => ({
      ...prev,
      maxParticipants: Math.max(4, Math.min(20, prev.maxParticipants + delta)),
    }))
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.title.length < 2) {
      newErrors.title = '제목은 2자 이상 입력해주세요'
    }
    if (!formData.meetingDate) {
      newErrors.meetingDate = '날짜를 선택해주세요'
    }
    if (!formData.meetingTime) {
      newErrors.meetingTime = '시간을 선택해주세요'
    }
    if (!formData.placeName) {
      newErrors.placeName = '장소를 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    if (!session?.user?.region) return

    setIsLoading(true)
    try {
      const meetingDateTime = new Date(
        `${formData.meetingDate}T${formData.meetingTime}`
      ).toISOString()

      const input: CreateMeetingInput = {
        title: formData.title,
        description: formData.description || undefined,
        gameType: formData.gameType,
        meetingDate: meetingDateTime,
        duration: formData.duration,
        region: session.user.region,
        placeName: formData.placeName,
        address: formData.address || formData.placeName,
        latitude: formData.latitude,
        longitude: formData.longitude,
        maxParticipants: formData.maxParticipants,
        minLevel: formData.minLevel,
      }

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (res.ok) {
        const meeting = await res.json()
        router.push(`/meeting/${meeting.id}`)
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

  // 오늘 날짜 (최소 선택 가능 날짜)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h1 className="font-semibold text-gray-900">모임 만들기</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="px-4 py-4 space-y-6">
        {/* 게임 종류 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            게임 종류
          </label>
          <div className="grid grid-cols-3 gap-2">
            {GAME_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleGameTypeSelect(type.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  formData.gameType === type.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <span className="text-2xl">{type.emoji}</span>
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 모임 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            모임 제목
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="예: 성수동 경찰과 도둑 같이 해요!"
            className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.title ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* 날짜 & 시간 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜
            </label>
            <input
              type="date"
              name="meetingDate"
              value={formData.meetingDate}
              onChange={handleInputChange}
              min={today}
              className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.meetingDate ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.meetingDate && (
              <p className="mt-1 text-sm text-red-500">{errors.meetingDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시간
            </label>
            <input
              type="time"
              name="meetingTime"
              value={formData.meetingTime}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.meetingTime ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.meetingTime && (
              <p className="mt-1 text-sm text-red-500">{errors.meetingTime}</p>
            )}
          </div>
        </div>

        {/* 장소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            장소
          </label>
          <input
            type="text"
            name="placeName"
            value={formData.placeName}
            onChange={handleInputChange}
            placeholder="예: 서울숲 잔디광장"
            className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.placeName ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {errors.placeName && (
            <p className="mt-1 text-sm text-red-500">{errors.placeName}</p>
          )}
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="상세 주소 (선택)"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary mt-2"
          />
        </div>

        {/* 모집 인원 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            모집 인원
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleParticipantsChange(-1)}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <span className="text-2xl font-bold text-gray-900 w-12 text-center">
              {formData.maxParticipants}
            </span>
            <button
              onClick={() => handleParticipantsChange(1)}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
            <span className="text-sm text-gray-500">명 (4~20명)</span>
          </div>
        </div>

        {/* 참여 조건 (레벨) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            참여 조건 (최소 레벨)
          </label>
          <select
            name="minLevel"
            value={formData.minLevel}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label} 이상
              </option>
            ))}
          </select>
        </div>

        {/* 상세 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상세 설명 (선택)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="모임에 대한 추가 정보를 입력해주세요"
            rows={4}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
        <Button fullWidth size="lg" onClick={handleSubmit} isLoading={isLoading}>
          모임 만들기
        </Button>
      </div>
    </div>
  )
}
