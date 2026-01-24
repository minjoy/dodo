'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button, Card } from '@/components/common'
import type { GameType, CreateMeetingInput } from '@/types'

const GAME_TYPES: { value: GameType; label: string; emoji: string; description: string }[] = [
  { value: 'GYEONGDO', label: '경찰과 도둑', emoji: '🚔', description: '추격과 도망의 스릴!' },
  { value: 'SULRAE', label: '술래잡기', emoji: '🏃', description: '숨고 찾는 재미' },
  { value: 'MUGUNGHWA', label: '무궁화 꽃이', emoji: '🌺', description: '긴장감 넘치는 게임' },
  { value: 'PIGU', label: '피구', emoji: '🏐', description: '팀워크가 핵심!' },
  { value: 'OTHER', label: '기타', emoji: '🎯', description: '자유롭게 정해요' },
]

const LEVELS = [
  { value: 1, label: 'Lv.1 새싹', emoji: '🌱' },
  { value: 2, label: 'Lv.2 동네친구', emoji: '👋' },
  { value: 3, label: 'Lv.3 단골멤버', emoji: '⭐' },
  { value: 4, label: 'Lv.4 동네대장', emoji: '👑' },
  { value: 5, label: 'Lv.5 전설', emoji: '🏆' },
]

export default function CreateMeetingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-100/50">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
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
          <div className="text-center">
            <h1 className="font-bold text-gray-900">모임 만들기</h1>
            <p className="text-xs text-gray-400">step {step} of 2</p>
          </div>
          <div className="w-10" />
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-300"
            style={{ width: `${step * 50}%` }}
          />
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {step === 1 ? (
          <>
            {/* 게임 종류 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="text-lg">🎮</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">어떤 게임을 할까요?</h2>
                  <p className="text-sm text-gray-500">함께 즐길 게임을 선택하세요</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GAME_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleGameTypeSelect(type.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 ${
                      formData.gameType === type.value
                        ? 'bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/30 scale-[1.02]'
                        : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    <span className="text-3xl">{type.emoji}</span>
                    <span className="text-sm font-bold">{type.label}</span>
                    <span className={`text-xs ${formData.gameType === type.value ? 'text-white/70' : 'text-gray-400'}`}>
                      {type.description}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* 모임 제목 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-lg">✏️</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">모임 이름은요?</h2>
                  <p className="text-sm text-gray-500">매력적인 제목으로 친구들을 모아보세요</p>
                </div>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="예: 성수동 경찰과 도둑 같이 해요!"
                className={`w-full px-5 py-4 bg-white border-2 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                  errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-100 focus:border-primary'
                }`}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.title}
                </p>
              )}
            </section>

            {/* 날짜 & 시간 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <span className="text-lg">📅</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">언제 만날까요?</h2>
                  <p className="text-sm text-gray-500">날짜와 시간을 정해주세요</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">날짜</label>
                  <input
                    type="date"
                    name="meetingDate"
                    value={formData.meetingDate}
                    onChange={handleInputChange}
                    min={today}
                    className={`w-full px-4 py-3.5 bg-white border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                      errors.meetingDate ? 'border-red-500' : 'border-gray-100 focus:border-primary'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">시간</label>
                  <input
                    type="time"
                    name="meetingTime"
                    value={formData.meetingTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3.5 bg-white border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all ${
                      errors.meetingTime ? 'border-red-500' : 'border-gray-100 focus:border-primary'
                    }`}
                  />
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* 장소 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <span className="text-lg">📍</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">어디서 만날까요?</h2>
                  <p className="text-sm text-gray-500">만날 장소를 알려주세요</p>
                </div>
              </div>
              <input
                type="text"
                name="placeName"
                value={formData.placeName}
                onChange={handleInputChange}
                placeholder="예: 서울숲 잔디광장"
                className={`w-full px-5 py-4 bg-white border-2 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all mb-3 ${
                  errors.placeName ? 'border-red-500' : 'border-gray-100 focus:border-primary'
                }`}
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="상세 주소 (선택)"
                className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </section>

            {/* 모집 인원 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="text-lg">👥</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">몇 명이 모일까요?</h2>
                  <p className="text-sm text-gray-500">적정 인원을 설정해주세요 (4~20명)</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={() => handleParticipantsChange(-1)}
                    className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-2xl text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                    </svg>
                  </button>
                  <div className="text-center">
                    <span className="text-5xl font-bold text-gray-900">{formData.maxParticipants}</span>
                    <span className="text-xl text-gray-400 ml-1">명</span>
                  </div>
                  <button
                    onClick={() => handleParticipantsChange(1)}
                    className="w-14 h-14 flex items-center justify-center bg-primary/10 rounded-2xl text-primary hover:bg-primary/20 active:scale-95 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </section>

            {/* 참여 조건 (레벨) */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                  <span className="text-lg">⭐</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">참여 조건</h2>
                  <p className="text-sm text-gray-500">최소 레벨을 설정해주세요</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setFormData((prev) => ({ ...prev, minLevel: level.value }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                      formData.minLevel === level.value
                        ? 'bg-gradient-to-r from-accent to-yellow-400 text-gray-900 font-bold shadow-lg shadow-accent/30'
                        : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-accent/50'
                    }`}
                  >
                    <span className="text-lg">{level.emoji}</span>
                    <span className="text-sm">{level.label} 이상</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 상세 설명 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-lg shadow-gray-600/30">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">추가 설명 (선택)</h2>
                  <p className="text-sm text-gray-500">더 알려주고 싶은 것이 있나요?</p>
                </div>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="모임에 대한 추가 정보를 입력해주세요"
                rows={4}
                className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none transition-all"
              />
            </section>
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 p-4 safe-bottom">
        {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            disabled={!formData.title || !formData.meetingDate || !formData.meetingTime}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              formData.title && formData.meetingDate && formData.meetingTime
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            다음 단계
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-4 px-6 rounded-2xl font-bold text-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              이전
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.placeName || isLoading}
              className={`flex-[2] py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                formData.placeName && !isLoading
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  생성 중...
                </>
              ) : (
                <>
                  모임 만들기
                  <span className="text-xl">🎉</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
