const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ── 닉네임 풀 (자연스러운 한국어 게임 닉네임) ──
const NICKNAMES = [
  '달리는호랑이', '바람의아이', '골목대장민수', '숨바꼭질왕', '번개소녀',
  '느린거북이', '웃는해바라기', '밤하늘별이', '뛰는사슴', '푸른파도',
  '동네형아준호', '작은여우', '빠른토끼', '하늘다람쥐', '구름위산책',
  '놀이터지킴이', '초록잎새', '햇살가득', '용감한사자', '달빛요정',
  '운동왕민지', '파란하늘', '웃음대장', '숲속나그네', '별빛산책',
  '도둑잡는경찰', '놀이왕수현', '바다소라', '꿈꾸는나무', '새벽이슬',
  '거침없는발걸음', '잔디밟는소리', '달려라하니', '골목탐험가', '야호산바람',
  '뛰뛰빵빵', '작은영웅', '동네한바퀴', '씩씩한곰', '길위의고양이',
  '아침햇살', '산들바람', '별따러가자', '날으는펭귄', '숨은보물찾기',
  '공원산책러', '도시모험가', '황금발바닥', '웃는달님', '놀자놀자',
]

// ── 동네 풀 (실제 서울 동네) ──
const REGIONS = [
  '성수동', '홍대', '강남', '잠실', '건대',
  '합정', '신촌', '연남동', '망원동', '왕십리',
  '서울숲', '압구정', '선릉', '신사', '역삼',
  '이태원', '한남동', '용산', '종로', '을지로',
  '혜화', '성북동', '북촌', '삼청동', '광화문',
]

// ── 자기소개 풀 ──
const BIOS = [
  '주말마다 밖에서 뛰노는 게 최고!',
  '경찰과 도둑 마스터를 향해 달리는 중',
  '술래잡기 좋아하는 직장인입니다',
  '동네에서 같이 놀 사람 찾아요~',
  '운동 겸 놀이! 일석이조',
  '무궁화 꽃이 피었습니다 장인',
  '매일 퇴근 후 한 게임!',
  '주말엔 무조건 밖으로!',
  '새로운 동네 친구를 만들고 싶어요',
  '체력은 국력! 매일 운동하는 사람',
  '피구 에이스 출신입니다 ㅎㅎ',
  '재밌는 사람들과 함께하고 싶어요',
  '동네 놀이터가 내 운동장',
  '스트레스는 뛰면서 풀자!',
  null, // 일부 사용자는 소개 없음
  null,
  null,
]

// ── 성별/연령대 풀 ──
const GENDERS = ['male', 'female']
const AGE_RANGES = ['20~29', '20~29', '20~29', '30~39', '30~39', '30~39', '30~39', '40~49']
const BIRTH_YEARS = ['1986', '1988', '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999', '2000', '2001', '2002', '2003']

// ── 뱃지 코드 ──
const BADGE_CODES = [
  'FIRST_MEETING', 'MEETING_5', 'MEETING_10', 'MEETING_30', 'MEETING_50',
  'FIRST_HOST', 'HOST_5', 'HOST_10', 'HOST_20',
  'LIKE_10', 'LIKE_30', 'LIKE_50',
  'GYEONGDO_MASTER', 'SULRAE_MASTER', 'MUGUNGHWA_MASTER',
  'EARLY_BIRD', 'PERFECT_ATTENDANCE',
]

// ── 유틸리티 ──
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

// 경험치 → 레벨 계산
const LEVEL_EXP_TABLE = [0, 30, 80, 180, 350, 600, 1000, 1600, 2500, 4000]

function calculateLevel(exp) {
  for (let level = LEVEL_EXP_TABLE.length; level >= 1; level--) {
    if (exp >= LEVEL_EXP_TABLE[level - 1]) {
      return level
    }
  }
  return 1
}

// ── 초기 사용자 프로필 생성 (서비스 초창기 낮은 활동량) ──
function generateUser(index) {
  const nickname = NICKNAMES[index]
  const region = pick(REGIONS)
  const bio = pick(BIOS)
  const gender = pick(GENDERS)
  const ageRange = pick(AGE_RANGES)
  const birthYear = pick(BIRTH_YEARS)

  // 초기 유저: 서비스가 막 시작되어 전체적으로 활동량이 낮음
  let meetingCount
  let hostCount
  let likeReceived
  let noShowCount

  const tier = Math.random()

  if (tier < 0.10) {
    // ── 초기 활발 유저 (10%): 서비스 초기 적극 참여자 ──
    meetingCount = rand(3, 5)
    hostCount = rand(1, 2)
    likeReceived = rand(1, 4)
    noShowCount = 0
  } else if (tier < 0.35) {
    // ── 참여 시작 유저 (25%): 몇 번 참여해본 유저 ──
    meetingCount = rand(1, 3)
    hostCount = Math.random() < 0.3 ? 1 : 0
    likeReceived = rand(0, 2)
    noShowCount = 0
  } else if (tier < 0.65) {
    // ── 첫 경험 유저 (30%): 한 번 참여하거나 가입만 한 유저 ──
    meetingCount = rand(0, 1)
    hostCount = 0
    likeReceived = rand(0, 1)
    noShowCount = 0
  } else {
    // ── 가입만 한 유저 (35%): 아직 활동 없음 ──
    meetingCount = 0
    hostCount = 0
    likeReceived = 0
    noShowCount = 0
  }

  // 경험치 계산 (참여*15 + 호스팅*25 + 좋아요*5)
  const exp = meetingCount * 15 + hostCount * 25 + likeReceived * 5
  const level = calculateLevel(exp)

  // ── 자격에 맞는 뱃지 결정 ──
  const earnedBadges = []

  // 참여 뱃지
  if (meetingCount >= 1) earnedBadges.push('FIRST_MEETING')
  if (meetingCount >= 5) earnedBadges.push('MEETING_5')

  // 호스트 뱃지
  if (hostCount >= 1) earnedBadges.push('FIRST_HOST')
  if (hostCount >= 5) earnedBadges.push('HOST_5')

  // 얼리버드 (초기 가입자: 40% 확률)
  if (Math.random() < 0.4) earnedBadges.push('EARLY_BIRD')

  // ── 대표 뱃지 선정 (최대 2개) ──
  const repBadges = earnedBadges.length > 0 ? pickN(earnedBadges, Math.min(2, earnedBadges.length)) : []

  return {
    nickname,
    region,
    meetingCount,
    hostCount,
    likeReceived,
    noShowCount,
    exp,
    level,
    bio,
    gender,
    ageRange,
    birthYear,
    badgeCodes: earnedBadges,
    representativeBadgeCodes: repBadges,
  }
}

async function main() {
  console.log('=== 더미 사용자 50명 시드 시작 ===\n')

  // 1. 기존 뱃지가 시드되어 있는지 확인
  const badgeCount = await prisma.badge.count()
  if (badgeCount === 0) {
    console.error('뱃지가 아직 시드되지 않았습니다. 먼저 seed-badges를 실행하세요.')
    process.exit(1)
  }

  // 뱃지 코드 → ID 매핑
  const allBadges = await prisma.badge.findMany()
  const badgeMap = new Map(allBadges.map((b) => [b.code, b.id]))

  // 2. 기존 더미 유저 확인
  const existingDummyCount = await prisma.user.count({ where: { isDummy: true } })
  if (existingDummyCount > 0) {
    console.log(`기존 더미 유저 ${existingDummyCount}명이 있습니다. 먼저 삭제하시겠습니까?`)
    console.log('삭제하려면: node prisma/delete-dummy-users.js')
    console.log('계속 진행합니다 (중복 닉네임은 건너뜁니다)...\n')
  }

  let created = 0
  let skipped = 0

  for (let i = 0; i < 50; i++) {
    const user = generateUser(i)

    // 닉네임 중복 체크
    const existing = await prisma.user.findUnique({
      where: { nickname: user.nickname },
    })
    if (existing) {
      console.log(`  [SKIP] ${user.nickname} - 이미 존재하는 닉네임`)
      skipped++
      continue
    }

    // kakaoId 더미 생성 (DUMMY_ 접두사로 구분)
    const dummyKakaoId = `DUMMY_${String(i + 1).padStart(4, '0')}_${Date.now()}`

    // 대표 뱃지 ID 가져오기
    const repBadge1Code = user.representativeBadgeCodes[0]
    const repBadge2Code = user.representativeBadgeCodes[1]
    const repBadge1Id = repBadge1Code ? badgeMap.get(repBadge1Code) : null
    const repBadge2Id = repBadge2Code ? badgeMap.get(repBadge2Code) : null

    // 가입일 랜덤 (최근 1~14일 사이 - 초기 서비스라 최근 가입)
    const daysAgo = rand(1, 14)
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

    // 사용자 생성
    const createdUser = await prisma.user.create({
      data: {
        kakaoId: dummyKakaoId,
        nickname: user.nickname,
        bio: user.bio,
        region: user.region,
        gender: user.gender,
        ageRange: user.ageRange,
        birthYear: user.birthYear,
        level: user.level,
        exp: user.exp,
        meetingCount: user.meetingCount,
        hostCount: user.hostCount,
        likeReceived: user.likeReceived,
        noShowCount: user.noShowCount,
        isDummy: true,
        hasViewedMeeting: user.meetingCount > 0,
        representativeBadgeId: repBadge1Id ?? undefined,
        representativeBadge2Id: repBadge2Id ?? undefined,
        createdAt,
      },
    })

    // 획득 뱃지 연결
    for (const badgeCode of user.badgeCodes) {
      const badgeId = badgeMap.get(badgeCode)
      if (!badgeId) continue

      // earnedAt은 가입일과 현재 사이의 랜덤 날짜
      const earnedDaysAgo = rand(0, daysAgo)
      const earnedAt = new Date(Date.now() - earnedDaysAgo * 24 * 60 * 60 * 1000)

      await prisma.userBadge.create({
        data: {
          userId: createdUser.id,
          badgeId,
          earnedAt,
        },
      })
    }

    const badgeNames = user.badgeCodes.map((c) => {
      const badge = allBadges.find((b) => b.code === c)
      return badge ? badge.icon : c
    }).join(' ')

    console.log(
      `  [${String(i + 1).padStart(2, '0')}] ${user.nickname.padEnd(10)} ` +
      `| ${user.region.padEnd(5)} ` +
      `| Lv.${String(user.level).padEnd(3)} ` +
      `| 참여:${String(user.meetingCount).padStart(2)} ` +
      `| 개설:${String(user.hostCount).padStart(2)} ` +
      `| 좋아요:${String(user.likeReceived).padStart(2)} ` +
      `| 뱃지: ${badgeNames || '없음'}`
    )
    created++
  }

  console.log(`\n=== 완료: ${created}명 생성, ${skipped}명 스킵 ===`)
  console.log('더미 데이터 삭제: node prisma/delete-dummy-users.js')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
