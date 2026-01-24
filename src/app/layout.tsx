import type { Metadata, Viewport } from 'next'
import './globals.css'
import AuthProvider from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: '경도 - 동네 친구 만들기',
  description: '회사 빼고 친구 만드는 법, 어른들의 경찰과 도둑 게임 모임 플랫폼',
  keywords: ['동네 모임', '친구 만들기', '경찰과 도둑', '술래잡기', '오프라인 모임'],
  authors: [{ name: '경도' }],
  openGraph: {
    title: '경도 - 동네 친구 만들기',
    description: '회사 빼고 친구 만드는 법',
    url: 'https://www.supercost.co.kr',
    siteName: '경도',
    locale: 'ko_KR',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF6B35',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          <main className="min-h-screen bg-gray-50">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
