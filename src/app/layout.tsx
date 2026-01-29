import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import AuthProvider from '@/components/providers/AuthProvider'

const SITE_URL = 'https://www.supercost.co.kr'

export const metadata: Metadata = {
  title: '경도 - 동네 친구 만들기',
  description: '회사 빼고 친구 만드는 법, 어른들의 경찰과 도둑 게임 모임 플랫폼',
  keywords: ['동네 모임', '친구 만들기', '경찰과 도둑', '술래잡기', '오프라인 모임'],
  authors: [{ name: '경도' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: '경도 - 동네 친구 만들기',
    description: '회사 빼고 친구 만드는 법, 어른들의 경찰과 도둑 게임 모임 플랫폼',
    url: SITE_URL,
    siteName: '경도',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: '경도 - 동네 친구 만들기',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '경도 - 동네 친구 만들기',
    description: '회사 빼고 친구 만드는 법, 어른들의 경찰과 도둑 게임 모임 플랫폼',
    images: [`${SITE_URL}/og-default.png`],
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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7YY3RHYBWP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-7YY3RHYBWP');
          `}
        </Script>
      </head>
      <body className="antialiased bg-gray-100">
        <AuthProvider>
          <main className="min-h-screen bg-gray-50 max-w-[1000px] mx-auto shadow-sm">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
