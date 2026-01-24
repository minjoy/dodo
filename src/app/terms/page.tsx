import Link from 'next/link'

export const metadata = {
  title: '서비스 이용약관 - 경도',
  description: '경도 서비스 이용약관',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4">
        <Link href="/" className="text-primary font-bold text-xl">
          경도
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">서비스 이용약관</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">시행일: 2024년 1월 1일</p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제1조 (목적)</h2>
            <p>
              이 약관은 경도(이하 "회사")가 제공하는 동네 기반 오프라인 게임 모임 플랫폼 서비스(이하 "서비스")의
              이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제2조 (정의)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>"서비스"란 회사가 제공하는 동네 기반 오프라인 게임 모임 매칭 및 관련 서비스를 의미합니다.</li>
              <li>"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원을 의미합니다.</li>
              <li>"회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 자를 의미합니다.</li>
              <li>"모임"이란 회원이 서비스를 통해 개설하거나 참여하는 오프라인 게임 활동을 의미합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력을 발생합니다.</li>
              <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</li>
              <li>변경된 약관은 공지사항을 통해 공지함으로써 효력을 발생합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제4조 (서비스의 제공)</h2>
            <p>회사는 다음과 같은 서비스를 제공합니다:</p>
            <ol className="list-decimal list-inside space-y-2 mt-2">
              <li>동네 기반 오프라인 게임 모임 개설 및 참여 서비스</li>
              <li>회원 간 모임 매칭 서비스</li>
              <li>회원 프로필 및 레벨 관리 서비스</li>
              <li>모임 후기 및 평가 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제5조 (회원가입)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>이용자는 회사가 정한 절차에 따라 회원가입을 신청합니다.</li>
              <li>회사는 카카오 계정을 통한 소셜 로그인 방식으로 회원가입을 처리합니다.</li>
              <li>회원가입은 이용자의 약관 동의와 함께 완료됩니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제6조 (회원의 의무)</h2>
            <p>회원은 다음 행위를 하여서는 안 됩니다:</p>
            <ol className="list-decimal list-inside space-y-2 mt-2">
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 무단 변경</li>
              <li>회사가 금지한 정보의 송신 또는 게시</li>
              <li>회사 및 제3자의 저작권 등 지적재산권 침해</li>
              <li>회사 및 제3자의 명예 훼손 또는 업무 방해</li>
              <li>외설 또는 폭력적인 내용의 게시</li>
              <li>모임 무단 불참(노쇼)</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제7조 (서비스 이용 제한)</h2>
            <p>
              회사는 회원이 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우,
              서비스 이용을 제한하거나 회원 자격을 상실시킬 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제8조 (면책조항)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>회사는 천재지변 등 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대해 책임지지 않습니다.</li>
              <li>회사는 회원이 모임에서 발생한 사고나 분쟁에 대해 직접적인 책임을 지지 않습니다.</li>
              <li>회원 간 또는 회원과 제3자 간의 분쟁은 당사자 간에 해결해야 합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제9조 (분쟁 해결)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>회사와 회원 간 분쟁이 발생한 경우 상호 협의하여 해결합니다.</li>
              <li>협의가 이루어지지 않을 경우 관할 법원에 소를 제기할 수 있습니다.</li>
            </ol>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              본 약관은 2024년 1월 1일부터 시행됩니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
