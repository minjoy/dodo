import { signOut } from 'next-auth/react'

let isRedirecting = false

/**
 * fetch 래퍼 - 401 응답 시 자동으로 로그인 만료 처리 및 로그인페이지로 이동
 * 현재 페이지 URL을 보존하여 로그인 후 원래 페이지로 돌아올 수 있도록 함
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init)

  if (response.status === 401 && !isRedirecting) {
    isRedirecting = true
    alert('로그인이 만료되었습니다. 다시 로그인해주세요.')

    const currentPath = window.location.pathname + window.location.search
    const redirectTo = currentPath !== '/' ? `?redirectTo=${encodeURIComponent(currentPath)}` : ''
    await signOut({ callbackUrl: `/login${redirectTo}`, redirect: true })
  }

  return response
}
