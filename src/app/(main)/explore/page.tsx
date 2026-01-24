'use client'

import { Button } from '@/components/common'

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">탐색</h1>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center px-4 py-20">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">곧 오픈 예정</h2>
        <p className="text-gray-500 text-center mb-6">
          다른 동네의 경도 모임도
          <br />
          탐색할 수 있게 됩니다
        </p>
        <Button variant="outline" disabled>
          Coming Soon
        </Button>
      </div>
    </div>
  )
}
