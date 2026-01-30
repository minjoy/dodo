import Link from 'next/link'

export const metadata = {
  title: '서비스 이용약관',
  description: '경도 서비스 이용약관입니다. 경도는 동네 기반 오프라인 게임 모임 플랫폼입니다.',
  alternates: {
    canonical: '/terms',
  },
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
          <p className="text-sm text-gray-500">시행일: 2025년 1월 27일</p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제1조 (목적)</h2>
            <p>
              이 약관은 와하공방(이하 "회사")이 제공하는 동네 기반 오프라인 게임 모임 플랫폼 서비스 "경도"(이하 "서비스")의
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
              <li>"떠들기"란 회원이 서비스 내 전광판에 게시하는 짧은 메시지(최대 50자)를 의미합니다.</li>
              <li>"배지"란 회원의 활동에 따라 부여되는 디지털 표시물을 의미합니다.</li>
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
              <li>떠들기(전광판) 서비스: 짧은 메시지 공유</li>
              <li>모임 댓글 서비스: 모임 내 회원 간 소통</li>
              <li>배지 시스템: 활동에 따른 배지 획득 및 관리</li>
              <li>랭킹 시스템: 개인 및 지역 랭킹 서비스</li>
              <li>푸시 알림 서비스: 모임 리마인더, 리뷰 알림, 공지사항 알림</li>
              <li>공지사항 서비스: 서비스 관련 중요 안내</li>
              <li>고객센터 서비스: 문의 및 불만 처리</li>
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
              <li>떠들기, 댓글, 리뷰 등에 부적절하거나 불쾌한 내용 게시</li>
              <li>허위 신고 또는 악의적인 신고</li>
              <li>서비스 운영을 고의로 방해하는 행위</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제7조 (신고 및 제재)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>회원은 다른 회원의 부적절한 행위(노쇼, 괴롭힘, 스팸 등)를 서비스 내에서 신고할 수 있습니다.</li>
              <li>회사는 신고 내용을 검토하여 적절한 조치를 취할 수 있습니다.</li>
              <li>허위 신고 또는 악의적 신고를 반복하는 회원에게는 제재가 가해질 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제8조 (서비스 이용 제한)</h2>
            <p>
              회사는 회원이 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우,
              서비스 이용을 제한하거나 회원 자격을 상실시킬 수 있습니다.
            </p>
            <ol className="list-decimal list-inside space-y-2 mt-2">
              <li>서비스 이용 제한은 일시적 정지 또는 영구 정지의 형태로 이루어질 수 있습니다.</li>
              <li>이용 제한 조치에 대해서는 서비스 내 공지 또는 개별 통지를 통해 안내합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제9조 (면책조항)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>회사는 천재지변 등 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
              <li>회사는 회원의 귀책사유로 인한 서비스 이용 장애에 대해 책임지지 않습니다.</li>
              <li>회사는 회원이 모임에서 발생한 사고나 분쟁에 대해 직접적인 책임을 지지 않습니다.</li>
              <li>회원 간 또는 회원과 제3자 간의 분쟁은 당사자 간에 해결해야 합니다.</li>
              <li>회사는 회원이 서비스에 게시한 떠들기, 댓글, 리뷰 등의 내용에 대해 책임지지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제10조 (분쟁 해결)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>회사와 회원 간 분쟁이 발생한 경우 상호 협의하여 해결합니다.</li>
              <li>협의가 이루어지지 않을 경우 관할 법원에 소를 제기할 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">제11조 (고객센터)</h2>
            <p>
              서비스 이용과 관련한 문의 및 불만 처리는 고객센터를 통해 접수하실 수 있습니다.
            </p>
            <ul className="list-none space-y-1 mt-2">
              <li>운영사: 와하공방</li>
              <li>이메일: miniface.ai@gmail.com</li>
            </ul>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              본 약관은 2025년 1월 27일부터 시행됩니다.
            </p>
          </section>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="max-w-3xl mx-auto px-4 py-8 text-center text-xs text-gray-300 leading-relaxed">
        <p>상호명: 와하공방 | 대표자: 김수연</p>
        <p>사업장 소재지: 서울특별시 성북구 오패산로4길 42 2층 와하공방</p>
        <p>통신판매업번호: 2024-서울성북-1373</p>
      </footer>
    </div>
  )
}
