'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/common'
import ImageCropper from '@/components/ImageCropper'

interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon: string
}

interface UserBadge {
  id: string
  badge: Badge
}

interface UserData {
  id: string
  nickname: string
  profileImage: string | null
  bio: string | null
  region: string
  badges: UserBadge[]
  representativeBadge: Badge | null
  representativeBadgeId: string | null
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null)

  const [showImageCropper, setShowImageCropper] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [showBadgeModal, setShowBadgeModal] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/users/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setNickname(data.nickname)
        setBio(data.bio || '')
        setProfileImage(data.profileImage)
        setSelectedBadgeId(data.representativeBadgeId)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImageFile(file)
      setShowImageCropper(true)
    }
  }

  const handleCropComplete = (croppedImage: string) => {
    setProfileImage(croppedImage)
    setShowImageCropper(false)
    setSelectedImageFile(null)
  }

  const handleSave = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim(),
          bio: bio.trim() || null,
          profileImage,
          representativeBadgeId: selectedBadgeId,
        }),
      })

      if (res.ok) {
        await updateSession()
        alert('프로필이 수정되었습니다')
        router.back()
      } else {
        const data = await res.json()
        alert(data.message || '프로필 수정에 실패했습니다')
      }
    } catch (error) {
      alert('프로필 수정에 실패했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const selectedBadge = user?.badges.find((ub) => ub.badge.id === selectedBadgeId)?.badge

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100/50 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">프로필 수정</h1>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="text-primary font-semibold disabled:text-gray-400"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* 프로필 이미지 */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-[92px] h-[92px] rounded-full border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
              <Avatar
                src={profileImage}
                alt={nickname}
                size="3xl"
                fallback={nickname}
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-sm text-primary font-medium"
          >
            사진 변경
          </button>
        </div>

        {/* 닉네임 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            닉네임
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력하세요"
            maxLength={10}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-xs text-gray-400 mt-2">2~10자, 한글/영문/숫자 사용 가능</p>
        </div>

        {/* 자기소개 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            자기소개
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="자기소개를 입력하세요 (선택)"
            maxLength={100}
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <p className="text-xs text-gray-400 mt-2">{bio.length}/100</p>
        </div>

        {/* 대표 뱃지 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            대표 뱃지
          </label>
          <button
            onClick={() => setShowBadgeModal(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl"
          >
            {selectedBadge ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedBadge.icon}</span>
                <span className="font-medium text-gray-800">{selectedBadge.name}</span>
              </div>
            ) : (
              <span className="text-gray-400">뱃지를 선택하세요</span>
            )}
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <p className="text-xs text-gray-400 mt-2">프로필에서 대표로 표시될 뱃지를 선택하세요</p>
        </div>
      </div>

      {/* 이미지 크롭 모달 */}
      {showImageCropper && selectedImageFile && (
        <ImageCropper
          imageFile={selectedImageFile}
          onCrop={handleCropComplete}
          onCancel={() => {
            setShowImageCropper(false)
            setSelectedImageFile(null)
          }}
        />
      )}

      {/* 뱃지 선택 모달 */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="bg-white rounded-t-3xl w-full max-h-[70vh] overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">대표 뱃지 선택</h3>
              <button
                onClick={() => setShowBadgeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(70vh-60px)]">
              {user?.badges && user.badges.length > 0 ? (
                <div className="space-y-2">
                  {/* 선택 안함 옵션 */}
                  <button
                    onClick={() => {
                      setSelectedBadgeId(null)
                      setShowBadgeModal(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                      !selectedBadgeId ? 'bg-primary/10 border-2 border-primary' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">❌</span>
                    <span className="font-medium text-gray-700">선택 안함</span>
                  </button>
                  {user.badges.map((ub) => (
                    <button
                      key={ub.id}
                      onClick={() => {
                        setSelectedBadgeId(ub.badge.id)
                        setShowBadgeModal(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                        selectedBadgeId === ub.badge.id
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl">{ub.badge.icon}</span>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-800">{ub.badge.name}</p>
                        <p className="text-xs text-gray-500">{ub.badge.description}</p>
                      </div>
                      {selectedBadgeId === ub.badge.id && (
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <span className="text-4xl">🎯</span>
                  <p className="mt-2">아직 획득한 뱃지가 없어요</p>
                  <p className="text-sm mt-1">모임에 참여해서 뱃지를 획득해보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
