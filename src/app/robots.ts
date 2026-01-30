import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.supercost.co.kr'

  const disallowPaths = [
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
  ]

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Yeti',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Daumoa',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: disallowPaths,
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowPaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
