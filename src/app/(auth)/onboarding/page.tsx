'use client'

import { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { validateNickname } from '@/lib/nickname'
import { fetchWithAuth } from '@/lib/fetchWithAuth'
import ImageCropper from '@/components/ImageCropper'
import { getAllRegions, searchRegions, type RegionData } from '@/data/regions'

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}

function OnboardingContent() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [nickname, setNickname] = useState('')
  const [nicknameError, setNicknameError] = useState('')
  const [isCheckingNickname, setIsCheckingNickname] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [regionSearch, setRegionSearch] = useState('')
  const [enabledRegionNames, setEnabledRegionNames] = useState<Set<string> | null>(null)

  // 이용 가능한 동네 목록 조회
  useEffect(() => {
    fetch('/api/regions/enabled')
      .then((res) => res.json())
      .then((data: string[]) => setEnabledRegionNames(new Set(data)))
      .catch(() => setEnabledRegionNames(null))
  }, [])

  const filteredRegions = useMemo(() => {
    let regions: RegionData[]
    if (!regionSearch.trim()) {
      regions = getAllRegions()
    } else {
      regions = searchRegions(regionSearch)
    }
    // 이용 가능한 동네만 필터링
    if (enabledRegionNames) {
      regions = regions.filter((r) => enabledRegionNames.has(r.name))
    }
    return regions
  }, [regionSearch, enabledRegionNames])

  // 인기지역과 나머지 분리
  const popularRegions = useMemo(() => filteredRegions.filter((r) => r.popular), [filteredRegions])
  const otherRegions = useMemo(() => filteredRegions.filter((r) => !r.popular), [filteredRegions])

  const [openDistricts, setOpenDistricts] = useState<Set<string>>(new Set())

  const seoulRegions = useMemo(
    () => otherRegions.filter((r) => r.district.endsWith('구')),
    [otherRegions]
  )

  const nonSeoulGrouped = useMemo(() => {
    const regions = otherRegions.filter((r) => !r.district.endsWith('구'))
    const map = new Map<string, RegionData[]>()
    regions.forEach((r) => {
      if (!map.has(r.district)) map.set(r.district, [])
      map.get(r.district)!.push(r)
    })
    return Array.from(map.entries()).map(([district, regions]) => ({ district, regions }))
  }, [otherRegions])

  const toggleDistrict = (district: string) => {
    setOpenDistricts((prev) => {
      const next = new Set(prev)
      if (next.has(district)) next.delete(district)
      else next.add(district)
      return next
    })
  }

  // 로그인 상태 및 온보딩 완료 여부 체크
  useEffect(() => {
    if (status === 'unauthenticated') {
      // 미인증 시 로그인 페이지로 이동하되, callbackUrl이 있으면 보존
      const redirectTo = callbackUrl
        ? `/login?redirectTo=${encodeURIComponent(callbackUrl)}`
        : '/login'
      router.push(redirectTo)
    } else if (status === 'authenticated' && session?.user?.region) {
      // 이미 온보딩을 완료한 사용자는 callbackUrl 또는 홈으로 리다이렉트
      router.replace(callbackUrl || '/home')
    }
  }, [status, session, router, callbackUrl])

  // 닉네임 유효성 검사
  useEffect(() => {
    if (!nickname) {
      setNicknameError('')
      return
    }

    const validation = validateNickname(nickname)
    if (!validation.isValid) {
      setNicknameError(validation.error || '')
      return
    }

    const timer = setTimeout(async () => {
      setIsCheckingNickname(true)
      try {
        const res = await fetchWithAuth(`/api/users/check-nickname?nickname=${encodeURIComponent(nickname)}`)
        if (res.status === 401) return
        const data = await res.json()
        if (!data.available) {
          setNicknameError('이미 사용 중인 닉네임입니다')
        } else {
          setNicknameError('')
        }
      } catch {
        // 에러 무시
      } finally {
        setIsCheckingNickname(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [nickname])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택할 수 있습니다')
      return
    }

    // 10MB 제한
    if (file.size > 10 * 1024 * 1024) {
      alert('10MB 이하의 이미지만 선택할 수 있습니다')
      return
    }

    setSelectedFile(file)
    setShowCropper(true)

    // input 초기화 (같은 파일 다시 선택 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCropComplete = (croppedDataUrl: string) => {
    setProfileImage(croppedDataUrl)
    setShowCropper(false)
    setSelectedFile(null)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setSelectedFile(null)
  }

  const handleSubmit = async (region: string) => {
    if (!nickname || nicknameError || isCheckingNickname) return

    setIsLoading(true)
    try {
      const res = await fetchWithAuth('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          region,
          nickname,
          profileImage: profileImage || undefined,
        }),
      })

      if (res.status === 401) return
      if (res.ok) {
        await update({ region })
        router.push(callbackUrl || '/home')
      } else {
        const error = await res.json()
        alert(error.message || '오류가 발생했습니다')
        if (error.message?.includes('닉네임')) {
          setStep(1)
        }
      }
    } catch (error) {
      console.error('Failed to update:', error)
      alert('오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const isNicknameValid = nickname.length >= 2 && !nicknameError && !isCheckingNickname

  // 로딩 중이거나, 미인증이거나, 이미 온보딩 완료한 경우 로딩 표시
  if (status === 'loading' || status === 'unauthenticated' || session?.user?.region) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="px-4 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{step === 1 ? '👤' : '📍'}</span>
          <h1 className="text-xl font-bold text-gray-900">
            {step === 1 ? '프로필 설정' : '동네 설정'}
          </h1>
        </div>
        <p className="text-gray-500">
          {step === 1 ? '경도에서 사용할 프로필을 설정해주세요' : '활동할 동네를 선택해주세요'}
        </p>

        {/* Progress */}
        <div className="flex gap-2 mt-4">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
        </div>
      </header>

      {step === 1 ? (
        /* Step 1: 프로필 설정 */
        <main className="flex-1 px-4 pb-32">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden group"
            >
              {profileImage ? (
                <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </button>
            <p className="mt-2 text-sm text-gray-400">
              {profileImage ? '탭하여 변경' : '탭하여 사진 추가 (선택)'}
            </p>
          </div>

          {/* 닉네임 */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2~10자, 한글/영문/숫자"
              className={`w-full px-4 py-4 border-2 rounded-xl text-lg focus:outline-none transition-colors ${
                nicknameError
                  ? 'border-red-400 focus:border-red-500'
                  : nickname && !nicknameError
                    ? 'border-green-400 focus:border-green-500'
                    : 'border-gray-200 focus:border-primary'
              }`}
            />
            {nicknameError && (
              <p className="mt-2 text-sm text-red-500">{nicknameError}</p>
            )}
            {nickname && !nicknameError && !isCheckingNickname && (
              <p className="mt-2 text-sm text-green-500">사용 가능한 닉네임입니다</p>
            )}
            {isCheckingNickname && (
              <p className="mt-2 text-sm text-gray-400">확인 중...</p>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">닉네임 규칙</span>
            </p>
            <ul className="mt-2 text-sm text-gray-500 space-y-1">
              <li>• 2~10자 이내</li>
              <li>• 한글, 영문, 숫자만 사용 가능</li>
              <li>• 욕설, 비속어 사용 불가</li>
              <li>• 다른 사용자와 중복 불가</li>
            </ul>
          </div>
        </main>
      ) : (
        /* Step 2: 동네 설정 */
        <main className="flex-1 px-4 pb-32 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-4">동네를 선택하면 해당 지역 모임을 볼 수 있어요</p>

          {/* 검색 */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={regionSearch}
              onChange={(e) => setRegionSearch(e.target.value)}
              placeholder="동네 이름 또는 지역명으로 검색"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
            {regionSearch && (
              <button
                onClick={() => setRegionSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {filteredRegions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🔍</p>
              <p className="font-medium">검색 결과가 없어요</p>
              <p className="text-sm mt-1">다른 이름으로 검색해보세요</p>
            </div>
          ) : regionSearch ? (
            /* 검색 모드: 플랫 리스트 */
            <>
              {filteredRegions.length > 0 && (
                <>
                  <h3 className="text-xs font-semibold text-gray-400 mb-2">검색 결과</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredRegions.map((region) => (
                      <button
                        key={region.name}
                        onClick={() => setSelectedRegion(region.name)}
                        disabled={isLoading}
                        className={`flex items-center gap-2 p-4 rounded-xl text-left transition-colors ${
                          selectedRegion === region.name
                            ? 'bg-primary text-white'
                            : 'bg-gray-50 text-gray-700 active:bg-gray-100'
                        }`}
                      >
                        <span className="text-xl">{region.emoji}</span>
                        <div className="flex flex-col">
                          <span className="font-medium">{region.name}</span>
                          <span className={`text-xs ${selectedRegion === region.name ? 'text-white/70' : 'text-gray-400'}`}>{region.district}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            /* 비검색 모드: 인기 + 서울 + 지역 아코디언 */
            <>
              {/* 인기 지역 */}
              {popularRegions.length > 0 && (
                <>
                  <h3 className="text-xs font-semibold text-gray-400 mb-2">인기 지역</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {popularRegions.map((region) => (
                      <button
                        key={region.name}
                        onClick={() => setSelectedRegion(region.name)}
                        disabled={isLoading}
                        className={`flex items-center gap-2 p-4 rounded-xl text-left transition-colors ${
                          selectedRegion === region.name
                            ? 'bg-primary text-white'
                            : 'bg-gray-50 text-gray-700 active:bg-gray-100'
                        }`}
                      >
                        <span className="text-xl">{region.emoji}</span>
                        <span className="font-medium">{region.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* 서울 */}
              {seoulRegions.length > 0 && (
                <>
                  <h3 className="text-xs font-semibold text-gray-400 mb-2 mt-4">서울</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {seoulRegions.map((region) => (
                      <button
                        key={region.name}
                        onClick={() => setSelectedRegion(region.name)}
                        disabled={isLoading}
                        className={`flex items-center gap-2 p-4 rounded-xl text-left transition-colors ${
                          selectedRegion === region.name
                            ? 'bg-primary text-white'
                            : 'bg-gray-50 text-gray-700 active:bg-gray-100'
                        }`}
                      >
                        <span className="text-xl">{region.emoji}</span>
                        <div className="flex flex-col">
                          <span className="font-medium">{region.name}</span>
                          <span className={`text-xs ${selectedRegion === region.name ? 'text-white/70' : 'text-gray-400'}`}>{region.district}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* 지역 (시/도별 아코디언) */}
              {nonSeoulGrouped.length > 0 && (
                <>
                  <h3 className="text-xs font-semibold text-gray-400 mb-2 mt-4">지역</h3>
                  <div className="space-y-2">
                    {nonSeoulGrouped.map((group) => (
                      <div key={group.district} className="bg-gray-50 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => toggleDistrict(group.district)}
                          className="w-full flex items-center justify-between px-4 py-3.5"
                        >
                          <span className="font-medium text-gray-900">{group.district}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{group.regions.length}개</span>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform ${openDistricts.has(group.district) ? 'rotate-180' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {openDistricts.has(group.district) && (
                          <div className="px-4 pb-4">
                            <div className="grid grid-cols-2 gap-2">
                              {group.regions.map((region) => (
                                <button
                                  key={region.name}
                                  onClick={() => setSelectedRegion(region.name)}
                                  disabled={isLoading}
                                  className={`flex items-center gap-2 p-4 rounded-xl text-left transition-colors ${
                                    selectedRegion === region.name
                                      ? 'bg-primary text-white'
                                      : 'bg-white text-gray-700 active:bg-gray-100'
                                  }`}
                                >
                                  <span className="text-xl">{region.emoji}</span>
                                  <span className="font-medium">{region.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <button
            onClick={() => handleSubmit('전체')}
            disabled={isLoading}
            className="w-full mt-8 py-3 text-gray-400 text-sm underline"
          >
            동네 설정 없이 이용하기
          </button>
        </main>
      )}

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-[1000px] mx-auto px-4 pt-4 pb-8 bg-white border-t border-gray-100 safe-bottom">
          {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            disabled={!isNicknameValid}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors ${
              isNicknameValid
                ? 'bg-primary text-white active:bg-primary-dark'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            다음
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              disabled={isLoading}
              className="flex-1 py-4 rounded-xl font-semibold bg-gray-100 text-gray-600"
            >
              이전
            </button>
            <button
              onClick={() => handleSubmit(selectedRegion)}
              disabled={!selectedRegion || isLoading}
              className={`flex-[2] py-4 rounded-xl font-semibold text-lg transition-colors ${
                selectedRegion && !isLoading
                  ? 'bg-primary text-white active:bg-primary-dark'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isLoading ? '설정 중...' : '시작하기'}
            </button>
            </div>
          )}
        </div>
      </div>

      {/* 이미지 크롭 모달 */}
      {showCropper && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  )
}
