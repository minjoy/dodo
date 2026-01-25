// 위치 관련 유틸리티

// 두 지점 간의 거리 계산 (Haversine formula) - 미터 단위 반환
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // 지구 반경 (미터)
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// 사용자가 특정 반경 내에 있는지 확인
export function isWithinRadius(
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon)
  return distance <= radiusMeters
}

// 기본 레디 가능 반경 (미터)
export const READY_RADIUS_METERS = 500

// 위치 권한 상태 타입
export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt' | 'unavailable'

// 브라우저/OS별 위치 설정 가이드
export const LOCATION_GUIDES = {
  ios_safari: {
    title: 'iOS Safari 위치 설정',
    steps: [
      '설정 앱을 엽니다',
      '개인정보 보호 및 보안 > 위치 서비스를 탭합니다',
      '위치 서비스가 켜져 있는지 확인합니다',
      '아래로 스크롤하여 Safari를 찾아 탭합니다',
      '"앱을 사용하는 동안" 또는 "항상"을 선택합니다',
    ],
  },
  ios_chrome: {
    title: 'iOS Chrome 위치 설정',
    steps: [
      '설정 앱을 엽니다',
      '개인정보 보호 및 보안 > 위치 서비스를 탭합니다',
      '위치 서비스가 켜져 있는지 확인합니다',
      '아래로 스크롤하여 Chrome을 찾아 탭합니다',
      '"앱을 사용하는 동안"을 선택합니다',
    ],
  },
  android_chrome: {
    title: 'Android Chrome 위치 설정',
    steps: [
      'Chrome 앱에서 오른쪽 상단 ⋮ 메뉴를 탭합니다',
      '설정 > 사이트 설정 > 위치를 탭합니다',
      '위치 액세스를 허용으로 설정합니다',
      '또는: 설정 앱 > 앱 > Chrome > 권한 > 위치에서 허용',
    ],
  },
  android_samsung: {
    title: 'Samsung Internet 위치 설정',
    steps: [
      '설정 앱을 엽니다',
      '앱 > Samsung Internet > 권한을 탭합니다',
      '위치를 탭하고 "앱 사용 중에만 허용"을 선택합니다',
    ],
  },
  desktop_chrome: {
    title: 'Chrome 데스크톱 위치 설정',
    steps: [
      '주소창 왼쪽의 자물쇠 아이콘을 클릭합니다',
      '사이트 설정을 클릭합니다',
      '위치를 "허용"으로 변경합니다',
      '페이지를 새로고침합니다',
    ],
  },
  desktop_safari: {
    title: 'Safari 데스크톱 위치 설정',
    steps: [
      'Safari > 환경설정을 엽니다',
      '웹사이트 탭을 클릭합니다',
      '왼쪽에서 위치를 선택합니다',
      '현재 웹사이트를 "허용"으로 설정합니다',
    ],
  },
  desktop_firefox: {
    title: 'Firefox 위치 설정',
    steps: [
      '주소창 왼쪽의 아이콘을 클릭합니다',
      '권한 섹션에서 위치 접근을 찾습니다',
      '"허용"을 선택합니다',
      '페이지를 새로고침합니다',
    ],
  },
}

// 사용자 에이전트 기반 가이드 추천
export function getLocationGuide(): typeof LOCATION_GUIDES[keyof typeof LOCATION_GUIDES] {
  if (typeof navigator === 'undefined') {
    return LOCATION_GUIDES.desktop_chrome
  }

  const ua = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isAndroid = /android/.test(ua)
  const isSamsung = /samsungbrowser/.test(ua)
  const isChrome = /chrome/.test(ua) && !/edge/.test(ua)
  const isSafari = /safari/.test(ua) && !/chrome/.test(ua)
  const isFirefox = /firefox/.test(ua)

  if (isIOS) {
    return isSafari ? LOCATION_GUIDES.ios_safari : LOCATION_GUIDES.ios_chrome
  }

  if (isAndroid) {
    return isSamsung ? LOCATION_GUIDES.android_samsung : LOCATION_GUIDES.android_chrome
  }

  // Desktop
  if (isSafari) return LOCATION_GUIDES.desktop_safari
  if (isFirefox) return LOCATION_GUIDES.desktop_firefox
  return LOCATION_GUIDES.desktop_chrome
}

// 현재 위치 가져오기 (Promise)
export function getCurrentPosition(
  options?: PositionOptions
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    )
  })
}

// 위치 권한 확인
export async function checkLocationPermission(): Promise<LocationPermissionStatus> {
  if (!navigator.geolocation) {
    return 'unavailable'
  }

  if (!navigator.permissions) {
    // permissions API not supported, try to get location
    return 'prompt'
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' })
    return result.state as LocationPermissionStatus
  } catch {
    return 'prompt'
  }
}
