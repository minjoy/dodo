import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '모임 찾기',
  description:
    '내 동네에서 열리는 경찰과 도둑, 술래잡기, 피구 등 다양한 오프라인 게임 모임을 찾아보세요. 새로운 동네 친구를 만들 수 있습니다.',
  alternates: {
    canonical: '/home',
  },
  openGraph: {
    title: '모임 찾기 | 경도',
    description:
      '내 동네에서 열리는 다양한 오프라인 게임 모임을 찾아보세요.',
  },
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
