import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import AuthProvider from '@/components/providers/AuthProvider'
import OfflineDetector from '@/components/common/OfflineDetector'

const SITE_URL = 'https://www.supercost.co.kr'
const SITE_NAME = '경도'
const SITE_TITLE = '경도 - 동네 친구 만들기'
const SITE_DESCRIPTION =
  '동네에서 함께 뛰어놀 친구를 찾아보세요. 경찰과 도둑, 술래잡기, 무궁화 꽃이 피었습니다 등 다양한 오프라인 게임 모임 플랫폼'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | 경도',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    '동네 모임',
    '친구 만들기',
    '경찰과 도둑',
    '술래잡기',
    '오프라인 모임',
    '동네 친구',
    '어른 놀이',
    '게임 모임',
    '무궁화 꽃이 피었습니다',
    '피구',
    '동네 게임',
    '소셜 모임',
  ],
  authors: [{ name: '경도', url: SITE_URL }],
  creator: '와하공방',
  publisher: '와하공방',
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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og-default.png'],
  },
  category: 'social',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF6B35',
}

// JSON-LD 구조화 데이터
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: '와하공방',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'miniface.ai@gmail.com',
        contactType: 'customer service',
        availableLanguage: 'Korean',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: '오패산로4길 42 2층',
        addressLocality: '성북구',
        addressRegion: '서울특별시',
        addressCountry: 'KR',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: 'SocialNetworkingApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'KRW',
      },
      creator: {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
      },
      inLanguage: 'ko',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
      },
      inLanguage: 'ko',
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-gray-100">
        <AuthProvider>
          <OfflineDetector />
          <main className="min-h-screen bg-gray-50 max-w-[1000px] mx-auto shadow-sm">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
