import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '동네 랭킹',
  description:
    '우리 동네가 제일 잘 논다! 전국 동네별 모임 활동 랭킹을 확인하고 우리 동네 순위를 올려보세요.',
  alternates: {
    canonical: '/ranking',
  },
  openGraph: {
    title: '동네 랭킹 | 경도',
    description:
      '전국 동네별 모임 활동 랭킹을 확인하세요. 우리 동네가 1등!',
  },
}

export default function RankingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
