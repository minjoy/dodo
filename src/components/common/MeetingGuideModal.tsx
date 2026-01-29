'use client'

interface MeetingGuideModalProps {
  type: 'host' | 'participant'
  onClose: () => void
}

export default function MeetingGuideModal({ type, onClose }: MeetingGuideModalProps) {
  if (type === 'host') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <span className="text-4xl">🎊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              모임을 만들었습니다!
            </h3>
            <p className="text-sm text-gray-500">
              모임장으로서 알아두면 좋은 것들이에요
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">1.</span>
              <p className="text-sm text-gray-700">
                <strong>친구를 초대</strong>하세요! 하단의 초대하기 버튼으로 링크를 공유할 수 있어요
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">2.</span>
              <p className="text-sm text-gray-700">
                모임 <strong>1시간 전</strong>부터 약속 장소에서 <strong>출쳌</strong>할 수 있어요
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">3.</span>
              <p className="text-sm text-gray-700">
                모임장과 참여자 모두 출쳌하면 <strong>모임 시작</strong> 버튼이 활성화돼요
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">4.</span>
              <p className="text-sm text-gray-700">
                게임이 끝나면 <strong>모임 종료</strong> 버튼을 꼭 눌러주세요
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/30"
          >
            확인
          </button>
        </div>
      </div>
    )
  }

  // participant type
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm">
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
            <span className="text-4xl">🎉</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            모임에 참여했습니다!
          </h3>
          <p className="text-sm text-gray-500">
            참여자로서 알아두면 좋은 것들이에요
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">1.</span>
            <p className="text-sm text-gray-700">
              모임 시간에 맞춰 <strong>약속 장소</strong>로 가주세요
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">2.</span>
            <p className="text-sm text-gray-700">
              모임 <strong>1시간 전</strong>부터 약속 장소에서 <strong>출쳌</strong>할 수 있어요
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">3.</span>
            <p className="text-sm text-gray-700">
              출쳌은 약속 장소 <strong>근처에서만</strong> 가능해요 (GPS 확인)
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">4.</span>
            <p className="text-sm text-gray-700">
              모임이 끝나면 함께한 사람들을 <strong>평가</strong>할 수 있어요
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/30"
        >
          확인
        </button>
      </div>
    </div>
  )
}
