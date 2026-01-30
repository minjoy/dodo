import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '유저 찾기',
  description:
    '경도에서 활동하는 유저들을 찾아보세요. 랭킹을 확인하고 새로운 동네 친구를 발견할 수 있습니다.',
  alternates: {
    canonical: '/explore',
  },
  openGraph: {
    title: '유저 찾기 | 경도',
    description:
      '경도에서 활동하는 유저들을 찾아보고 새로운 동네 친구를 만나보세요.',
  },
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
