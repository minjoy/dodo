import { signOut } from 'next-auth/react'

let isRedirecting = false

/**
 * fetch 래퍼 - 401 응답 시 자동으로 로그인 만료 처리 및 랜딩페이지로 이동
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init)

  if (response.status === 401 && !isRedirecting) {
    isRedirecting = true
    alert('로그인이 만료되었습니다. 다시 로그인해주세요.')
    await signOut({ callbackUrl: '/', redirect: true })
  }

  return response
}
