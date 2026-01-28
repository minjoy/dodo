'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface Announcement {
  id: string
  title: string
  content: string
  isPublished: boolean
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminAnnouncementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPublished: true,
    isPinned: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchAnnouncements()
    }
  }, [status, router])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/announcements')
      if (res.status === 403) {
        alert('관리자 권한이 필요합니다')
        router.push('/')
        return
      }
      if (res.ok) {
        const data = await res.json()
        setAnnouncements(data)
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement)
      setFormData({
        title: announcement.title,
        content: announcement.content,
        isPublished: announcement.isPublished,
        isPinned: announcement.isPinned,
      })
    } else {
      setEditingAnnouncement(null)
      setFormData({
        title: '',
        content: '',
        isPublished: true,
        isPinned: false,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAnnouncement(null)
    setFormData({
      title: '',
      content: '',
      isPublished: true,
      isPinned: false,
    })
  }

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요')
      return
    }

    setIsSubmitting(true)
    try {
      const url = editingAnnouncement
        ? `/api/announcements/${editingAnnouncement.id}`
        : '/api/announcements'
      const method = editingAnnouncement ? 'PUT' : 'POST'

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        handleCloseModal()
        fetchAnnouncements()
      } else {
        const error = await res.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Failed to save announcement:', error)
      alert('저장에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetchWithAuth(`/api/announcements/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchAnnouncements()
      } else {
        const error = await res.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Failed to delete announcement:', error)
      alert('삭제에 실패했습니다')
    }
  }

  const handleTogglePublish = async (announcement: Announcement) => {
    try {
      const res = await fetchWithAuth(`/api/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !announcement.isPublished }),
      })

      if (res.ok) {
        fetchAnnouncements()
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error)
    }
  }

  const handleTogglePin = async (announcement: Announcement) => {
    try {
      const res = await fetchWithAuth(`/api/announcements/${announcement.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !announcement.isPinned }),
      })

      if (res.ok) {
        fetchAnnouncements()
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">공지사항 관리</h1>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
          >
            + 새 공지
          </button>
        </div>
      </header>

      {/* 공지사항 목록 */}
      <div className="px-4 py-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <span className="text-4xl">📭</span>
            <p className="mt-2 text-gray-500">아직 공지사항이 없습니다</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-4 py-2 bg-primary text-white font-medium rounded-xl"
            >
              첫 공지사항 작성하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`bg-white rounded-2xl p-4 border ${
                  !announcement.isPublished ? 'border-gray-300 bg-gray-50' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {announcement.isPinned && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                          고정
                        </span>
                      )}
                      {!announcement.isPublished && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded">
                          비공개
                        </span>
                      )}
                      <h3 className="font-bold text-gray-900 truncate">{announcement.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(announcement.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(announcement)}
                      className={`p-2 rounded-lg transition-colors ${
                        announcement.isPinned
                          ? 'bg-amber-100 text-amber-600'
                          : 'hover:bg-gray-100 text-gray-400'
                      }`}
                      title={announcement.isPinned ? '고정 해제' : '상단 고정'}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 4V3c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1H4c-.55 0-1 .45-1 1s.45 1 1 1h1v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1c.55 0 1-.45 1-1s-.45-1-1-1h-4z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleTogglePublish(announcement)}
                      className={`p-2 rounded-lg transition-colors ${
                        announcement.isPublished
                          ? 'bg-green-100 text-green-600'
                          : 'hover:bg-gray-100 text-gray-400'
                      }`}
                      title={announcement.isPublished ? '비공개로 변경' : '공개로 변경'}
                    >
                      {announcement.isPublished ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenModal(announcement)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                      title="수정"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 작성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingAnnouncement ? '공지사항 수정' : '새 공지사항'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="공지사항 제목"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="공지사항 내용을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={6}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">공개</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">상단 고정</span>
                </label>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={handleCloseModal}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl disabled:bg-gray-300 transition-colors"
              >
                {isSubmitting ? '저장 중...' : editingAnnouncement ? '수정하기' : '작성하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
