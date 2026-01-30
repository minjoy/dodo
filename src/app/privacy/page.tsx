import Link from 'next/link'

export const metadata = {
  title: '개인정보처리방침',
  description: '경도 개인정보처리방침입니다. 와하공방은 이용자의 개인정보를 안전하게 보호합니다.',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4">
        <Link href="/" className="text-primary font-bold text-xl">
          경도
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">개인정보처리방침</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">시행일: 2025년 1월 27일</p>

          <p>
            와하공방(이하 "회사")은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수하고 있습니다.
            회사는 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로
            이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. 수집하는 개인정보 항목</h2>
            <p>회사는 회원가입 및 서비스 이용을 위해 다음과 같은 개인정보를 수집합니다:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>필수항목: 카카오 계정 정보(고유ID), 닉네임, 프로필 사진, 성별, 출생 연도</li>
              <li>선택항목: 이메일 주소</li>
              <li>위치정보: 동네(지역) 설정 정보</li>
              <li>푸시 알림 관련: 푸시 알림 수신 동의 여부, 브라우저 푸시 구독 정보</li>
              <li>서비스 이용 과정에서 수집되는 정보: 서비스 이용기록, 접속 로그, 접속 IP 정보, 기기정보</li>
              <li>이용자 생성 콘텐츠: 떠들기(전광판) 메시지, 모임 댓글, 리뷰 및 평가 내용, 신고 내용</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. 개인정보 수집 방법</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>카카오 소셜 로그인을 통한 회원가입</li>
              <li>서비스 내 프로필 설정 및 동네 설정</li>
              <li>푸시 알림 수신 동의</li>
              <li>서비스 이용 과정에서 자동 수집</li>
              <li>고객센터 문의를 통한 수집</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. 개인정보의 수집 및 이용 목적</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>회원 가입 및 관리: 회원제 서비스 제공, 개인식별, 불량회원 부정이용 방지</li>
              <li>서비스 제공: 모임 개설 및 참여, 동네 기반 모임 매칭, 게임 진행(역할 배정 등)</li>
              <li>커뮤니티 기능: 떠들기(전광판), 모임 댓글, 리뷰 및 평가 서비스 제공</li>
              <li>알림 서비스: 모임 리마인더, 리뷰 알림, 공지사항 안내 등 푸시 알림 발송</li>
              <li>랭킹 및 배지 시스템: 개인/지역 랭킹 산정, 배지 부여</li>
              <li>신고 처리: 부적절한 행위에 대한 신고 접수 및 처리</li>
              <li>고객 지원: 고객센터를 통한 문의 응대 및 불만 처리</li>
              <li>서비스 개선: 서비스 이용 통계, 서비스 개선 및 신규 서비스 개발</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. 개인정보의 보유 및 이용 기간</h2>
            <p>
              회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
              단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>회원 탈퇴 시: 즉시 파기</li>
              <li>부정이용 방지를 위한 정보(정지된 계정 정보): 탈퇴 후 1년</li>
              <li>관계법령에 의한 보존: 계약 또는 청약철회 등에 관한 기록 5년, 대금결제 및 재화 등의 공급에 관한 기록 5년, 소비자의 불만 또는 분쟁처리에 관한 기록 3년</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. 개인정보의 제3자 제공</h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. 개인정보의 파기 절차 및 방법</h2>
            <p>
              회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다.
              파기절차 및 방법은 다음과 같습니다:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>파기절차: 회원이 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 일정 기간 저장된 후 파기됩니다.</li>
              <li>파기방법: 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. 이용자의 권리와 행사 방법</h2>
            <p>이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
              <li>푸시 알림 수신 동의 철회</li>
            </ul>
            <p className="mt-2">
              위 권리 행사는 서비스 내 설정 또는 고객센터를 통해 가능합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">8. 개인정보 보호책임자</h2>
            <p>
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
              개인정보 처리와 관련한 이용자의 불만처리 및 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:
            </p>
            <ul className="list-none space-y-1 mt-2">
              <li>사업자명: 와하공방</li>
              <li>개인정보 보호책임자: 경도 운영팀</li>
              <li>이메일: miniface.ai@gmail.com</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">9. 개인정보처리방침의 변경</h2>
            <p>
              이 개인정보처리방침은 법령, 정책 또는 보안기술의 변경에 따라 내용의 추가, 삭제 및 수정이 있을 수 있으며,
              변경 시에는 시행 최소 7일 전에 서비스 내 공지사항을 통해 고지합니다.
            </p>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              본 개인정보처리방침은 2025년 1월 27일부터 시행됩니다.
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
