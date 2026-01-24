'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    kakao: any
  }
}

interface KakaoMapProps {
  latitude: number
  longitude: number
  placeName?: string
  className?: string
}

export default function KakaoMap({ latitude, longitude, placeName, className = '' }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    const loadKakaoMap = () => {
      if (!mapRef.current) return

      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 3,
      }

      const map = new window.kakao.maps.Map(mapRef.current, options)
      mapInstanceRef.current = map

      // 마커 추가
      const markerPosition = new window.kakao.maps.LatLng(latitude, longitude)
      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
      })
      marker.setMap(map)

      // 장소명 표시
      if (placeName) {
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;white-space:nowrap;">${placeName}</div>`,
        })
        infowindow.open(map, marker)
      }
    }

    // 카카오맵 스크립트 로드
    if (window.kakao && window.kakao.maps) {
      loadKakaoMap()
    } else {
      const script = document.createElement('script')
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`
      script.async = true
      script.onload = () => {
        window.kakao.maps.load(loadKakaoMap)
      }
      document.head.appendChild(script)
    }
  }, [latitude, longitude, placeName])

  // 좌표 변경 시 지도 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && window.kakao) {
      const newCenter = new window.kakao.maps.LatLng(latitude, longitude)
      mapInstanceRef.current.setCenter(newCenter)
    }
  }, [latitude, longitude])

  return (
    <div
      ref={mapRef}
      className={`w-full h-48 rounded-xl bg-gray-100 ${className}`}
    />
  )
}
