import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '고객센터',
  description:
    '경도 고객센터입니다. 서비스 이용 중 궁금한 점이나 문제가 있으시면 문의해주세요.',
  alternates: {
    canonical: '/support',
  },
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
