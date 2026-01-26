'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Announcement {
  id: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
}

export default function SupportPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements')
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

  const handleSupportDeveloper = () => {
    window.open('https://litt.ly/miniface', '_blank')
  }

  const toggleAnnouncement = (id: string) => {
    setExpandedAnnouncement(prev => prev === id ? null : id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // 최근 7일 이내 작성된 공지인지 확인
  const isNew = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays <= 7
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">고객센터</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* 문의하기 섹션 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">문의하기</h2>
              <p className="text-sm text-gray-500">궁금한 점이나 건의사항을 보내주세요</p>
            </div>
          </div>
          <a
            href="mailto:miniface.ai@gmail.com"
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-medium text-gray-900">이메일 문의</p>
                <p className="text-sm text-primary">miniface.ai@gmail.com</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* 공지사항 섹션 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">공지사항</h2>
              <p className="text-sm text-gray-500">경도의 새로운 소식을 확인하세요</p>
            </div>
          </div>

          {isLoading ? (
            <div className="px-5 py-8 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : announcements.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {announcements.map((announcement) => (
                <div key={announcement.id}>
                  <button
                    onClick={() => toggleAnnouncement(announcement.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-left flex-1 min-w-0">
                      {announcement.isPinned && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded flex-shrink-0">고정</span>
                      )}
                      {isNew(announcement.createdAt) && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded flex-shrink-0">NEW</span>
                      )}
                      <span className="font-medium text-gray-900 truncate">{announcement.title}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-sm text-gray-400">{formatDate(announcement.createdAt)}</span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedAnnouncement === announcement.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {expandedAnnouncement === announcement.id && (
                    <div className="px-5 pb-4">
                      <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {announcement.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <span className="text-4xl">📭</span>
              <p className="mt-2 text-gray-500">아직 공지사항이 없습니다</p>
            </div>
          )}
        </div>

        {/* 개발자 응원하기 */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💝</span>
            </div>
            <div>
              <h2 className="font-bold text-lg">개발자 응원하기</h2>
              <p className="text-sm text-white/80">경도를 만드는 개발자를 응원해주세요!</p>
            </div>
          </div>
          <p className="text-sm text-white/90 mb-4 leading-relaxed">
            여러분의 따뜻한 응원이 더 좋은 서비스를 만드는 원동력이 됩니다.
            작은 관심이 큰 힘이 됩니다!
          </p>
          <button
            onClick={handleSupportDeveloper}
            className="w-full py-3 bg-white text-rose-500 font-bold rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
          >
            <span>응원하러 가기</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        </div>

        {/* 앱 정보 */}
        <div className="text-center text-sm text-gray-400 pt-4">
          <p>경도 v1.0.0</p>
          <p className="mt-1">Made with ❤️ by miniface</p>
        </div>
      </div>
    </div>
  )
}
