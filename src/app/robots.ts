import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.supercost.co.kr'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/mng-c4r3x/',
          '/admin/',
          '/settings/',
          '/onboarding',
          '/auth-error',
          '/chat/',
          '/create',
          '/my/',
          '/meeting/*/edit',
          '/meeting/*/play',
          '/meeting/*/review',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
