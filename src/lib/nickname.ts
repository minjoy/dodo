// 닉네임 블랙리스트 - 욕설, 유명인 이름 등
const BLACKLIST = [
  // 욕설
  '시발', '씨발', '병신', '지랄', '개새끼', 'fuck', 'shit', 'bitch',
  '좆', '보지', '자지', '섹스', 'sex', '야동',
  // 유명인
  '아이유', '방탄소년단', 'bts', '블랙핑크', 'blackpink',
  '손흥민', '김연아', '이영표', '박지성',
  '대통령', '윤석열', '이재명', '문재인', '박근혜',
  // 관리자 사칭
  'admin', '관리자', '운영자', 'operator', 'system', '시스템',
  '경도운영', '경도관리', 'gyeongdo',
  // 기타
  '테스트', 'test', 'null', 'undefined',
]

// 닉네임 금지 패턴 (정규식)
const BANNED_PATTERNS = [
  /^[0-9]+$/, // 숫자만
  /admin/i,
  /운영/,
  /관리/,
]

export interface NicknameValidationResult {
  isValid: boolean
  error?: string
}

export function validateNickname(nickname: string): NicknameValidationResult {
  // 공백 제거
  const trimmed = nickname.trim()

  // 길이 체크 (2~10자)
  if (trimmed.length < 2) {
    return { isValid: false, error: '닉네임은 2자 이상이어야 합니다' }
  }

  if (trimmed.length > 10) {
    return { isValid: false, error: '닉네임은 10자 이하여야 합니다' }
  }

  // 공백 포함 체크
  if (/\s/.test(trimmed)) {
    return { isValid: false, error: '닉네임에 공백을 사용할 수 없습니다' }
  }

  // 특수문자 체크 (한글, 영문, 숫자만 허용)
  if (!/^[가-힣a-zA-Z0-9]+$/.test(trimmed)) {
    return { isValid: false, error: '닉네임은 한글, 영문, 숫자만 사용할 수 있습니다' }
  }

  // 블랙리스트 체크
  const lowerNickname = trimmed.toLowerCase()
  for (const word of BLACKLIST) {
    if (lowerNickname.includes(word.toLowerCase())) {
      return { isValid: false, error: '사용할 수 없는 닉네임입니다' }
    }
  }

  // 패턴 체크
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { isValid: false, error: '사용할 수 없는 닉네임입니다' }
    }
  }

  return { isValid: true }
}

// 6자리 모임 공유 코드 생성
export function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 헷갈리는 문자 제외 (0, O, 1, I)
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
