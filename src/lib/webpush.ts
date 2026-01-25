import webpush from 'web-push'

// VAPID 키 설정
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BDpHJl-RTBOjTjgd3dnyieP1LE3QPlRn4CU1r1zrVjWqP5adv2HKz5rMmmDiZ8Mlrnsml3rKEpZmQfBBVGfSdXg'
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '62uh-l2SFrecNEpk2-9FfCBfJVQo38t_kEtu-RHVwlY'

webpush.setVapidDetails(
  'mailto:support@gyeongdo.kr',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

export { webpush, VAPID_PUBLIC_KEY }
