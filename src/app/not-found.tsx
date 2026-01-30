import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* 404 일러스트 */}
      <div className="relative mb-8">
        <div className="text-8xl font-black text-gray-100 select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 메시지 */}
      <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">
        페이지를 찾을 수 없어요
      </h1>
      <p className="text-gray-500 text-center mb-8 leading-relaxed">
        요청하신 페이지가 존재하지 않거나
        <br />
        주소가 변경되었을 수 있어요.
      </p>

      {/* 액션 버튼 */}
      <div className="w-full max-w-sm space-y-3">
        <Link
          href="/home"
          className="block w-full text-center bg-primary text-white font-semibold py-4 px-6 rounded-xl hover:bg-primary-dark transition-colors shadow-[0_4px_12px_rgba(255,107,53,0.3)] active:scale-[0.98]"
        >
          홈으로 돌아가기
        </Link>
      </div>

      {/* 고객센터 안내 */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-400 mb-1">
          문제가 계속되면 고객센터로 문의해주세요.
        </p>
        <a
          href="mailto:support@supercost.co.kr"
          className="text-sm text-primary font-medium hover:underline"
        >
          support@supercost.co.kr
        </a>
      </div>
    </div>
  )
}
