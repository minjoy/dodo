'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'

// VAPID 공개키 (src/lib/webpush.ts와 동일해야 함)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BDpHJl-RTBOjTjgd3dnyieP1LE3QPlRn4CU1r1zrVjWqP5adv2HKz5rMmmDiZ8Mlrnsml3rKEpZmQfBBVGfSdXg'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const { data: session, status } = useSession()
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | null>(null)

  // 푸시 알림 지원 여부 확인
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)

    if (supported && 'Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // 로그인 사용자에게 자동으로 서비스 워커 등록 및 구독 확인
  useEffect(() => {
    if (status === 'authenticated' && isSupported) {
      registerServiceWorker()
    }
  }, [status, isSupported])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')

      // 기존 구독 확인
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  }

  const subscribe = useCallback(async () => {
    if (!isSupported || status !== 'authenticated') return false

    try {
      // 알림 권한 요청
      const permissionResult = await Notification.requestPermission()
      setPermission(permissionResult)

      if (permissionResult !== 'granted') {
        return false
      }

      // 서비스 워커 등록
      const registration = await navigator.serviceWorker.ready

      // 푸시 구독
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // 서버에 구독 정보 저장
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
          },
        }),
      })

      if (res.ok) {
        setIsSubscribed(true)
        return true
      }

      return false
    } catch (error) {
      console.error('Push subscription failed:', error)
      return false
    }
  }, [isSupported, status])

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // 서버에서 구독 삭제
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        // 브라우저 구독 취소
        await subscription.unsubscribe()
        setIsSubscribed(false)
        return true
      }

      return false
    } catch (error) {
      console.error('Push unsubscribe failed:', error)
      return false
    }
  }, [isSupported])

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
  }
}
