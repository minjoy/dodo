'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

interface Comment {
  id: string
  content: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    nickname: string
    profileImage: string | null
    level: number
  }
}

interface CommentBoardProps {
  meetingId: string
  isParticipant: boolean
  isHost: boolean
}

export default function CommentBoard({ meetingId, isParticipant, isHost }: CommentBoardProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchComments = async () => {
    try {
      const res = await fetchWithAuth(`/api/meetings/${meetingId}/comments`)
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [meetingId])

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetchWithAuth(`/api/meetings/${meetingId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (res.ok) {
        setNewComment('')
        fetchComments()
      } else {
        const error = await res.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Failed to create comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const res = await fetchWithAuth(`/api/meetings/${meetingId}/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchComments()
      } else {
        const error = await res.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  const handleTogglePin = async (commentId: string) => {
    try {
      const res = await fetchWithAuth(`/api/meetings/${meetingId}/comments/${commentId}`, {
        method: 'PATCH',
      })

      if (res.ok) {
        fetchComments()
      } else {
        const error = await res.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  if (!isParticipant) return null

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💬</span>
        <h3 className="font-bold text-gray-900">참여자 게시판</h3>
        <span className="text-sm text-gray-400">({comments.length})</span>
      </div>

      {/* 댓글 입력 */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value.slice(0, 200))}
            placeholder="한마디 남기기..."
            className="flex-1 min-w-0 px-3 py-2 text-sm bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            className={`shrink-0 px-3 py-2 text-sm rounded-xl font-medium transition-all ${
              newComment.trim() && !isSubmitting
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {isSubmitting ? '...' : '등록'}
          </button>
        </div>
        <div className="text-right text-xs text-gray-400 mt-1">
          {newComment.length}/200
        </div>
      </div>

      {/* 댓글 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <p>아직 글이 없습니다</p>
          <p className="text-sm mt-1">첫 번째 글을 남겨보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isMyComment = comment.user.id === session?.user?.id

            return (
              <div
                key={comment.id}
                className={`rounded-xl p-4 ${
                  comment.isPinned
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 프로필 */}
                  <div className="flex-shrink-0">
                    {comment.user.profileImage ? (
                      <Image
                        src={comment.user.profileImage}
                        alt={comment.user.nickname}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">👤</span>
                      </div>
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {comment.isPinned && (
                        <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded font-medium">
                          📌 고정
                        </span>
                      )}
                      <span className="font-semibold text-gray-900 text-sm">
                        {comment.user.nickname}
                      </span>
                      <span className="text-xs text-gray-400">
                        Lv.{comment.user.level}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm break-words">
                      {comment.content}
                    </p>
                  </div>

                  {/* 버튼 영역 */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* 호스트용 고정/해제 버튼 */}
                    {isHost && (
                      <button
                        onClick={() => handleTogglePin(comment.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          comment.isPinned
                            ? 'text-yellow-600 hover:bg-yellow-100'
                            : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                        }`}
                        title={comment.isPinned ? '고정 해제' : '상단 고정'}
                      >
                        <svg className="w-4 h-4" fill={comment.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    )}

                    {/* 본인 글 삭제 버튼 */}
                    {isMyComment && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
