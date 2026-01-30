'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { getAllRegions } from '@/data/regions'
import type { RegionData } from '@/data/regions'

const ADMIN_COOKIE_KEY = 'mng_auth_x7k9'
const ADMIN_PASSWORD = 'care'

interface RegionSetting {
  region: string
  enabled: boolean
}

export default function AdminRegionsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [settings, setSettings] = useState<RegionSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [togglingRegion, setTogglingRegion] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [savedNotice, setSavedNotice] = useState('')
  const [isSavingNotice, setIsSavingNotice] = useState(false)

  const allRegions = useMemo(() => getAllRegions(), [])
  const regionsMap = useMemo(() => {
    const map = new Map<string, RegionData>()
    allRegions.forEach((r) => map.set(r.name, r))
    return map
  }, [allRegions])

  const settingsMap = useMemo(() => {
    const map = new Map<string, boolean>()
    settings.forEach((s) => map.set(s.region, s.enabled))
    return map
  }, [settings])

  useEffect(() => {
    const savedAuth = Cookies.get(ADMIN_COOKIE_KEY)
    if (savedAuth === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      fetchSettings()
    } else {
      router.push('/mng-c4r3x')
    }
  }, [router])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/regions')
      if (res.status === 403) {
        alert('관리자 권한이 필요합니다')
        router.push('/mng-c4r3x')
        return
      }
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
      // 공지사항 조회
      const noticeRes = await fetch('/api/admin/region-notice')
      if (noticeRes.ok) {
        const noticeData = await noticeRes.json()
        setNotice(noticeData.notice || '')
        setSavedNotice(noticeData.notice || '')
      }
    } catch (error) {
      console.error('Failed to fetch region settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotice = async () => {
    setIsSavingNotice(true)
    try {
      const res = await fetch('/api/admin/region-notice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notice }),
      })
      if (res.ok) {
        const data = await res.json()
        setSavedNotice(data.notice)
        setNotice(data.notice)
      } else {
        const error = await res.json()
        alert(error.message || '공지사항 저장에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to save notice:', error)
      alert('공지사항 저장에 실패했습니다')
    } finally {
      setIsSavingNotice(false)
    }
  }

  const handleToggle = async (region: string, currentEnabled: boolean) => {
    setTogglingRegion(region)
    try {
      const res = await fetch('/api/admin/regions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, enabled: !currentEnabled }),
      })

      if (res.ok) {
        setSettings((prev) =>
          prev.map((s) =>
            s.region === region ? { ...s, enabled: !currentEnabled } : s
          )
        )
      } else {
        const error = await res.json()
        alert(error.message || '설정 변경에 실패했습니다')
      }
    } catch (error) {
      console.error('Failed to toggle region:', error)
      alert('설정 변경에 실패했습니다')
    } finally {
      setTogglingRegion(null)
    }
  }

  const filteredSettings = useMemo(() => {
    if (!search.trim()) return settings
    const q = search.trim().toLowerCase()
    return settings.filter((s) => {
      const regionData = regionsMap.get(s.region)
      return (
        s.region.toLowerCase().includes(q) ||
        regionData?.district.toLowerCase().includes(q)
      )
    })
  }, [search, settings, regionsMap])

  // 그룹화: 인기 / 서울 / 지역(시·도별)
  const groupedSections = useMemo(() => {
    const list = filteredSettings
    const sections: { label: string; items: RegionSetting[] }[] = []

    // 인기 지역
    const popular = list.filter((s) => regionsMap.get(s.region)?.popular)
    if (popular.length > 0) {
      sections.push({ label: '인기 지역', items: popular })
    }

    // 서울 (인기 제외, district가 '구'로 끝나는 것, 단 '대구' 제외)
    const seoul = list.filter((s) => {
      const r = regionsMap.get(s.region)
      return r && !r.popular && r.district.endsWith('구') && r.district !== '대구'
    })
    if (seoul.length > 0) {
      sections.push({ label: '서울', items: seoul })
    }

    // 지역 (district가 '구'로 끝나지 않거나 '대구'인 것) → 시·도별 그룹
    const nonSeoul = list.filter((s) => {
      const r = regionsMap.get(s.region)
      return r && !r.popular && (!r.district.endsWith('구') || r.district === '대구')
    })
    const districtMap = new Map<string, RegionSetting[]>()
    nonSeoul.forEach((s) => {
      const r = regionsMap.get(s.region)
      const district = r?.district || '기타'
      if (!districtMap.has(district)) districtMap.set(district, [])
      districtMap.get(district)!.push(s)
    })
    districtMap.forEach((items, district) => {
      sections.push({ label: district, items })
    })

    return sections
  }, [filteredSettings, regionsMap])

  const enabledCount = settings.filter((s) => s.enabled).length
  const disabledCount = settings.filter((s) => !s.enabled).length

  if (!isAuthenticated || isLoading) {
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
              onClick={() => router.push('/mng-c4r3x')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">동네 관리</h1>
          </div>
          <div className="text-sm text-gray-500">
            <span className="text-green-600 font-medium">{enabledCount}</span> 활성
            {disabledCount > 0 && (
              <>
                {' / '}
                <span className="text-red-500 font-medium">{disabledCount}</span> 비활성
              </>
            )}
          </div>
        </div>
      </header>

      {/* 검색 */}
      <div className="px-4 py-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="동네 이름 또는 지역명으로 검색"
            className="w-full pl-10 pr-10 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 한줄 공지사항 */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            동네 한줄 공지사항
          </label>
          <p className="text-xs text-gray-400 mb-2">
            사용자 동네 설정 화면 상단에 노출됩니다. 비워두면 숨김 처리됩니다.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              placeholder="예: 강남구, 성북구 지역만 오픈되었습니다."
              maxLength={100}
              className="flex-1 px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={handleSaveNotice}
              disabled={isSavingNotice || notice === savedNotice}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                notice !== savedNotice && !isSavingNotice
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isSavingNotice ? '저장중...' : '저장'}
            </button>
          </div>
          {savedNotice && (
            <p className="text-xs text-green-600 mt-2">
              현재 공지: {savedNotice}
            </p>
          )}
        </div>
      </div>

      {/* 안내 */}
      <div className="px-4 mb-4">
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-700">
            비활성화된 동네는 온보딩, 모임만들기, 내 동네 변경에서 사용자에게 노출되지 않습니다.
          </p>
        </div>
      </div>

      {/* 동네 목록 */}
      <div className="px-4">
        {filteredSettings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <span className="text-4xl">🔍</span>
            <p className="mt-2 text-gray-500">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedSections.map((section) => (
              <div key={section.label}>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-500">{section.label}</h3>
                  <span className="text-xs text-gray-400">{section.items.length}개</span>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {section.items.map((setting, index) => {
                    const regionData = regionsMap.get(setting.region)
                    return (
                      <div
                        key={setting.region}
                        className={`flex items-center justify-between px-4 py-3 ${
                          index < section.items.length - 1 ? 'border-b border-gray-50' : ''
                        } ${!setting.enabled ? 'bg-gray-50' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl w-8 text-center">{regionData?.emoji || '📍'}</span>
                          <div>
                            <span className={`font-medium ${setting.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                              {setting.region}
                            </span>
                            <span className={`ml-2 text-xs ${setting.enabled ? 'text-gray-400' : 'text-gray-300'}`}>
                              {regionData?.district}
                            </span>
                            {regionData?.popular && (
                              <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                                인기
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggle(setting.region, setting.enabled)}
                          disabled={togglingRegion === setting.region}
                          className={`relative w-12 h-7 rounded-full transition-colors ${
                            setting.enabled ? 'bg-green-500' : 'bg-gray-300'
                          } ${togglingRegion === setting.region ? 'opacity-50' : ''}`}
                        >
                          <span
                            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                              setting.enabled ? 'left-[22px]' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
