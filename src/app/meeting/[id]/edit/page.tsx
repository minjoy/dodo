'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { GameType, MeetingWithDetails } from '@/types'

const GAME_TYPES: { value: GameType; label: string }[] = [
  { value: 'GYEONGDO', label: '🚔 경찰과 도둑' },
  { value: 'SULRAE', label: '🏃 술래잡기' },
  { value: 'MUGUNGHWA', label: '🌺 무궁화' },
  { value: 'PIGU', label: '🏐 피구' },
  { value: 'OTHER', label: '🎯 기타' },
]

const STATUS_OPTIONS = [
  { value: 'RECRUITING', label: '모집중' },
  { value: 'CLOSED', label: '모집마감' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'CANCELLED', label: '취소' },
]

export default function EditMeetingPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const meetingId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [meeting, setMeeting] = useState<MeetingWithDetails | null>(null)

  const [formData, setFormData] = useState({
    gameType: 'GYEONGDO' as GameType,
    title: '',
    description: '',
    meetingDate: '',
    meetingTime: '',
    placeName: '',
    maxParticipants: 8,
    status: 'RECRUITING',
  })

  useEffect(() => {
    fetchMeeting()
  }, [meetingId])

  const fetchMeeting = async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`)
      if (res.ok) {
        const data = await res.json()
        setMeeting(data)

        // 호스트가 아니면 접근 불가
        if (data.hostId !== session?.user?.id) {
          router.push(`/meeting/${meetingId}`)
          return
        }

        // 폼 데이터 초기화
        const meetingDate = new Date(data.meetingDate)
        setFormData({
          gameType: data.gameType,
          title: data.title,
          description: data.description || '',
          meetingDate: meetingDate.toISOString().split('T')[0],
          meetingTime: meetingDate.toTimeString().slice(0, 5),
          placeName: data.placeName,
          maxParticipants: data.maxParticipants,
          status: data.status,
        })
      } else {
        router.push('/home')
      }
    } catch (error) {
      console.error('Failed to fetch meeting:', error)
      router.push('/home')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const isValid = formData.title.length >= 2 && formData.meetingDate && formData.meetingTime && formData.placeName

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsSaving(true)
    try {
      const meetingDateTime = new Date(
        `${formData.meetingDate}T${formData.meetingTime}`
      ).toISOString()

      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          gameType: formData.gameType,
          meetingDate: meetingDateTime,
          placeName: formData.placeName,
          address: formData.placeName,
          maxParticipants: formData.maxParticipants,
          status: formData.status,
        }),
      })

      if (res.ok) {
        router.push(`/meeting/${meetingId}`)
      } else {
        const error = await res.json()
        alert(error.message || '수정에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to update meeting:', error)
      alert('수정에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('정말 이 모임을 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/home')
      } else {
        const error = await res.json()
        alert(error.message || '삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to delete meeting:', error)
      alert('삭제에 실패했습니다')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
        <p className="mt-4 text-gray-400 font-medium">모임 정보 불러오는 중...</p>
      </div>
    )
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
          <h1 className="text-lg font-bold text-gray-900">모임 수정</h1>
        </div>
      </header>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* 모임 상태 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            모임 상태
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              날짜 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="meetingDate"
              value={formData.meetingDate}
              onChange={handleInputChange}
              min={today}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="meetingTime"
              value={formData.meetingTime}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* 장소 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            장소 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="placeName"
            value={formData.placeName}
            onChange={handleInputChange}
            placeholder="예: 서울숲 잔디광장"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 모집 인원 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            모집 인원
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, maxParticipants: Math.max(4, prev.maxParticipants - 1) }))}
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

        {/* 버튼들 */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={!isValid || isSaving}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
              isValid && !isSaving
                ? 'bg-primary text-white active:bg-primary-dark'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="w-full py-4 rounded-xl font-semibold text-lg bg-red-50 text-red-500 active:bg-red-100 transition-colors"
          >
            모임 삭제
          </button>
        </div>
      </form>
    </div>
  )
}
