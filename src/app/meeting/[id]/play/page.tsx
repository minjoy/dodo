'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Avatar } from '@/components/common'
import {
  getCurrentPosition,
  checkLocationPermission,
  getLocationGuide,
  READY_RADIUS_METERS,
  calculateDistance,
} from '@/lib/location'

interface Participant {
  id: string
  userId: string
  isReady: boolean
  user: {
    id: string
    nickname: string
    profileImage: string | null
  }
}

interface GameRole {
  id: string
  userId: string
  role: 'POLICE' | 'THIEF'
  user: {
    id: string
    nickname: string
    profileImage: string | null
  }
}

interface Meeting {
  id: string
  title: string
  status: string
  latitude: number
  longitude: number
  placeName: string
  hostId: string
  policeCount: number | null
  thiefCount: number | null
  gameStartedAt: string | null
  host: {
    id: string
    nickname: string
    profileImage: string | null
  }
  participants: Participant[]
  gameRoles: GameRole[]
}

export default function GamePlayPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const meetingId = params.id as string

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'checking' | 'granted' | 'denied' | 'unavailable'>('checking')
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [showLocationGuide, setShowLocationGuide] = useState(false)
  const [showRoleSetup, setShowRoleSetup] = useState(false)
  const [policeCount, setPoliceCount] = useState(1)
  const [thiefCount, setThiefCount] = useState(1)
  const [isStarting, setIsStarting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [myRole, setMyRole] = useState<'POLICE' | 'THIEF' | null>(null)
  const [showRoleHistory, setShowRoleHistory] = useState(false)
  const [roleHistory, setRoleHistory] = useState<{ meetingTitle: string; role: string; date: string }[]>([])

  const isHost = session?.user?.id === meeting?.hostId
  const totalPlayers = meeting ? meeting.participants.length + 1 : 0

  const fetchMeeting = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`)
      if (res.ok) {
        const data = await res.json()
        setMeeting(data)

        // 내 레디 상태 확인
        const myParticipation = data.participants.find(
          (p: Participant) => p.userId === session?.user?.id
        )
        if (myParticipation) {
          setIsReady(myParticipation.isReady)
        }

        // 내 역할 확인
        if (data.gameRoles) {
          const myGameRole = data.gameRoles.find(
            (r: GameRole) => r.userId === session?.user?.id
          )
          if (myGameRole) {
            setMyRole(myGameRole.role)
          }
        }

        // 인원 수 기본값 설정
        const total = data.participants.length + 1
        const defaultPolice = Math.max(1, Math.floor(total / 3))
        setPoliceCount(defaultPolice)
        setThiefCount(total - defaultPolice)
      }
    } catch (error) {
      console.error('Failed to fetch meeting:', error)
    } finally {
      setIsLoading(false)
    }
  }, [meetingId, session?.user?.id])

  const checkLocation = useCallback(async () => {
    try {
      const permission = await checkLocationPermission()
      if (permission === 'denied') {
        setLocationStatus('denied')
        return
      }
      if (permission === 'unavailable') {
        setLocationStatus('unavailable')
        return
      }

      const position = await getCurrentPosition()
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
      setLocationStatus('granted')

      // 거리 계산
      if (meeting) {
        const dist = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          meeting.latitude,
          meeting.longitude
        )
        setDistance(Math.round(dist))
      }
    } catch (error) {
      console.error('Failed to get location:', error)
      setLocationStatus('denied')
    }
  }, [meeting])

  useEffect(() => {
    fetchMeeting()
    // 5초마다 새로고침 (실시간 레디 상태 확인)
    const interval = setInterval(fetchMeeting, 5000)
    return () => clearInterval(interval)
  }, [fetchMeeting])

  useEffect(() => {
    if (meeting) {
      checkLocation()
    }
  }, [meeting, checkLocation])

  const handleReady = async () => {
    if (!currentLocation) {
      setShowLocationGuide(true)
      return
    }

    try {
      const res = await fetch(`/api/meetings/${meetingId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          isReady: !isReady,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setIsReady(!isReady)
        fetchMeeting()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Failed to toggle ready:', error)
    }
  }

  const handleStartGame = async () => {
    if (!currentLocation) {
      setShowLocationGuide(true)
      return
    }

    setIsStarting(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          policeCount,
          thiefCount,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setShowRoleSetup(false)
        fetchMeeting()
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Failed to start game:', error)
    } finally {
      setIsStarting(false)
    }
  }

  const handleEndGame = async () => {
    if (!confirm('정말 게임을 종료하시겠습니까?')) return

    setIsEnding(true)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/end`, {
        method: 'POST',
      })

      if (res.ok) {
        router.push(`/meeting/${meetingId}/review`)
      } else {
        const data = await res.json()
        alert(data.message)
      }
    } catch (error) {
      console.error('Failed to end game:', error)
    } finally {
      setIsEnding(false)
    }
  }

  const fetchRoleHistory = async () => {
    try {
      const res = await fetch('/api/users/me/roles')
      if (res.ok) {
        const data = await res.json()
        setRoleHistory(data)
      }
    } catch (error) {
      console.error('Failed to fetch role history:', error)
    }
    setShowRoleHistory(true)
  }

  const locationGuide = getLocationGuide()
  const allReady = meeting?.participants.every((p) => p.isReady)
  const readyCount = meeting?.participants.filter((p) => p.isReady).length || 0
  const isWithinRange = distance !== null && distance <= READY_RADIUS_METERS

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">게임 정보 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">모임을 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white pb-32">
      {/* 헤더 */}
      <header className="bg-gray-900/80 backdrop-blur-lg sticky top-0 z-40 border-b border-white/10">
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-bold">{meeting.title}</h1>
          <button onClick={fetchRoleHistory} className="p-2 -mr-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 게임 진행 중 화면 */}
      {meeting.status === 'PLAYING' ? (
        <div className="px-4 py-8">
          {/* 내 역할 */}
          <div className="text-center mb-8">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl mb-4 ${
              myRole === 'POLICE'
                ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/50'
                : 'bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/50'
            }`}>
              {myRole === 'POLICE' ? '👮' : '🦹'}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              당신은 <span className={myRole === 'POLICE' ? 'text-blue-400' : 'text-red-400'}>
                {myRole === 'POLICE' ? '경찰' : '도둑'}
              </span>입니다!
            </h2>
            <p className="text-gray-400">
              {myRole === 'POLICE'
                ? '도둑을 모두 잡으세요!'
                : '경찰에게 잡히지 마세요!'}
            </p>
          </div>

          {/* 팀 구성 */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* 경찰 팀 */}
            <div className="bg-blue-500/20 rounded-2xl p-4 border border-blue-500/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👮</span>
                <h3 className="font-bold text-blue-400">경찰</h3>
                <span className="text-sm text-gray-400">({meeting.policeCount}명)</span>
              </div>
              <div className="space-y-2">
                {meeting.gameRoles
                  .filter((r) => r.role === 'POLICE')
                  .map((role) => (
                    <div key={role.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
                      <Avatar
                        src={role.user.profileImage}
                        alt={role.user.nickname}
                        size="xs"
                        fallback={role.user.nickname}
                      />
                      <span className="text-sm">{role.user.nickname}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* 도둑 팀 */}
            <div className="bg-red-500/20 rounded-2xl p-4 border border-red-500/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🦹</span>
                <h3 className="font-bold text-red-400">도둑</h3>
                <span className="text-sm text-gray-400">({meeting.thiefCount}명)</span>
              </div>
              <div className="space-y-2">
                {meeting.gameRoles
                  .filter((r) => r.role === 'THIEF')
                  .map((role) => (
                    <div key={role.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
                      <Avatar
                        src={role.user.profileImage}
                        alt={role.user.nickname}
                        size="xs"
                        fallback={role.user.nickname}
                      />
                      <span className="text-sm">{role.user.nickname}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 게임 시작 시간 */}
          {meeting.gameStartedAt && (
            <div className="text-center text-gray-400 text-sm mb-8">
              게임 시작: {new Date(meeting.gameStartedAt).toLocaleTimeString('ko-KR')}
            </div>
          )}

          {/* 호스트: 게임 종료 버튼 */}
          {isHost && (
            <button
              onClick={handleEndGame}
              disabled={isEnding}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30"
            >
              {isEnding ? '종료 중...' : '🏁 게임 종료'}
            </button>
          )}
        </div>
      ) : (
        /* 레디 대기 화면 */
        <div className="px-4 py-6">
          {/* 위치 상태 */}
          <div className={`rounded-2xl p-4 mb-6 ${
            isWithinRange
              ? 'bg-green-500/20 border border-green-500/30'
              : 'bg-yellow-500/20 border border-yellow-500/30'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                isWithinRange ? 'bg-green-500' : 'bg-yellow-500'
              }`}>
                {locationStatus === 'checking' ? '📍' : isWithinRange ? '✅' : '📍'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">
                  {locationStatus === 'checking' && '위치 확인 중...'}
                  {locationStatus === 'denied' && '위치 권한 필요'}
                  {locationStatus === 'unavailable' && '위치 서비스 불가'}
                  {locationStatus === 'granted' && (
                    isWithinRange ? '모임 장소 근처입니다!' : '모임 장소로 이동해주세요'
                  )}
                </h3>
                {distance !== null && (
                  <p className="text-sm text-gray-400">
                    {meeting.placeName} • 현재 {distance}m 거리
                    {!isWithinRange && ` (${READY_RADIUS_METERS}m 이내 필요)`}
                  </p>
                )}
              </div>
              {locationStatus === 'denied' && (
                <button
                  onClick={() => setShowLocationGuide(true)}
                  className="px-3 py-1 bg-white/20 rounded-lg text-sm"
                >
                  설정
                </button>
              )}
            </div>
          </div>

          {/* 참가자 레디 상태 */}
          <div className="bg-white/5 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <span className="text-xl">👥</span>
                참가자 ({readyCount}/{meeting.participants.length} 레디)
              </h3>
            </div>

            {/* 호스트 */}
            <div className="flex items-center gap-3 p-3 bg-primary/20 rounded-xl mb-2">
              <Avatar
                src={meeting.host.profileImage}
                alt={meeting.host.nickname}
                size="md"
                fallback={meeting.host.nickname}
              />
              <div className="flex-1">
                <span className="font-medium">{meeting.host.nickname}</span>
                <span className="ml-2 text-xs bg-primary px-2 py-0.5 rounded-full">호스트</span>
              </div>
              <span className="text-green-400 text-xl">✓</span>
            </div>

            {/* 참가자 목록 */}
            {meeting.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-2"
              >
                <Avatar
                  src={participant.user.profileImage}
                  alt={participant.user.nickname}
                  size="md"
                  fallback={participant.user.nickname}
                />
                <span className="flex-1 font-medium">{participant.user.nickname}</span>
                {participant.isReady ? (
                  <span className="text-green-400 text-xl">✓</span>
                ) : (
                  <span className="text-gray-500 text-sm">대기중</span>
                )}
              </div>
            ))}
          </div>

          {/* 액션 버튼 */}
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 p-4 pb-8">
            {isHost ? (
              <div className="space-y-3">
                {!allReady && (
                  <p className="text-center text-yellow-400 text-sm">
                    모든 참가자가 레디해야 시작할 수 있습니다
                  </p>
                )}
                <button
                  onClick={() => setShowRoleSetup(true)}
                  disabled={!allReady || !isWithinRange}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                    allReady && isWithinRange
                      ? 'bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  🎮 게임 시작하기
                </button>
              </div>
            ) : (
              <button
                onClick={handleReady}
                disabled={!isWithinRange}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                  isReady
                    ? 'bg-green-500 shadow-lg shadow-green-500/30'
                    : isWithinRange
                      ? 'bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30'
                      : 'bg-gray-700 text-gray-400'
                }`}
              >
                {isReady ? '✓ 레디 완료!' : '👋 레디'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 위치 설정 가이드 모달 */}
      {showLocationGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{locationGuide.title}</h3>
            <ol className="space-y-3 mb-6">
              {locationGuide.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-gray-300">{step}</span>
                </li>
              ))}
            </ol>
            <button
              onClick={() => {
                setShowLocationGuide(false)
                checkLocation()
              }}
              className="w-full py-3 bg-primary rounded-xl font-bold"
            >
              설정 완료
            </button>
          </div>
        </div>
      )}

      {/* 역할 설정 모달 */}
      {showRoleSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-6 text-center">역할 배정</h3>

            <div className="space-y-6 mb-8">
              {/* 경찰 인원 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👮</span>
                  <span className="font-bold">경찰</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (policeCount > 1) {
                        setPoliceCount(policeCount - 1)
                        setThiefCount(thiefCount + 1)
                      }
                    }}
                    className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xl font-bold">{policeCount}</span>
                  <button
                    onClick={() => {
                      if (thiefCount > 1) {
                        setPoliceCount(policeCount + 1)
                        setThiefCount(thiefCount - 1)
                      }
                    }}
                    className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 도둑 인원 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🦹</span>
                  <span className="font-bold">도둑</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (thiefCount > 1) {
                        setThiefCount(thiefCount - 1)
                        setPoliceCount(policeCount + 1)
                      }
                    }}
                    className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xl font-bold">{thiefCount}</span>
                  <button
                    onClick={() => {
                      if (policeCount > 1) {
                        setThiefCount(thiefCount + 1)
                        setPoliceCount(policeCount - 1)
                      }
                    }}
                    className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-400 text-sm mb-6">
              총 {totalPlayers}명 = 경찰 {policeCount}명 + 도둑 {thiefCount}명
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRoleSetup(false)}
                className="flex-1 py-3 bg-gray-700 rounded-xl font-bold"
              >
                취소
              </button>
              <button
                onClick={handleStartGame}
                disabled={isStarting}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-accent rounded-xl font-bold"
              >
                {isStarting ? '시작 중...' : '🎲 랜덤 배정 & 시작'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 역할 히스토리 모달 */}
      {showRoleHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">내 역할 히스토리</h3>
            {roleHistory.length > 0 ? (
              <div className="space-y-3">
                {roleHistory.map((record, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl flex items-center gap-3 ${
                      record.role === 'POLICE' ? 'bg-blue-500/20' : 'bg-red-500/20'
                    }`}
                  >
                    <span className="text-2xl">
                      {record.role === 'POLICE' ? '👮' : '🦹'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">{record.meetingTitle}</p>
                      <p className="text-sm text-gray-400">{record.date}</p>
                    </div>
                    <span className={record.role === 'POLICE' ? 'text-blue-400' : 'text-red-400'}>
                      {record.role === 'POLICE' ? '경찰' : '도둑'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">
                아직 게임 기록이 없습니다
              </p>
            )}
            <button
              onClick={() => setShowRoleHistory(false)}
              className="w-full py-3 bg-gray-700 rounded-xl font-bold mt-4"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
