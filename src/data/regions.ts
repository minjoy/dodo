// 전국 동네 데이터 (공유 데이터 소스)
// 서울: 동 단위 / 지방(광역시·도): 시·군·구 단위
// popular: true → 인기지역 (상단 표시)

export interface RegionData {
  name: string
  emoji: string
  district: string // 서울: 구 단위, 광역시: 시 단위, 도: 도 단위
  popular?: boolean
}

// 인기 지역 (상단 노출)
const POPULAR: RegionData[] = [
  { name: '성수동', emoji: '🏭', district: '성동구', popular: true },
  { name: '홍대', emoji: '🎸', district: '마포구', popular: true },
  { name: '강남', emoji: '💼', district: '강남구', popular: true },
  { name: '신촌', emoji: '🎓', district: '서대문구', popular: true },
  { name: '이태원', emoji: '🌍', district: '용산구', popular: true },
  { name: '건대', emoji: '🎪', district: '광진구', popular: true },
  { name: '잠실', emoji: '🏟️', district: '송파구', popular: true },
  { name: '여의도', emoji: '🌆', district: '영등포구', popular: true },
  { name: '망원동', emoji: '☕', district: '마포구', popular: true },
  { name: '연남동', emoji: '🌳', district: '마포구', popular: true },
  { name: '합정', emoji: '🎨', district: '마포구', popular: true },
  { name: '서울숲', emoji: '🌲', district: '성동구', popular: true },
  { name: '압구정', emoji: '✨', district: '강남구', popular: true },
  { name: '선릉', emoji: '🏢', district: '강남구', popular: true },
  { name: '신림', emoji: '📚', district: '관악구', popular: true },
  { name: '왕십리', emoji: '🚇', district: '성동구', popular: true },
]

// 전체 지역 (구별 정리)
const ALL_REGIONS: RegionData[] = [
  // === 인기 지역 (상단) ===
  ...POPULAR,

  // ============================================================
  // 서울특별시 (동 단위)
  // ============================================================

  // === 강남구 ===
  { name: '역삼', emoji: '💻', district: '강남구' },
  { name: '삼성', emoji: '🏬', district: '강남구' },
  { name: '청담', emoji: '💎', district: '강남구' },
  { name: '신사', emoji: '🛍️', district: '강남구' },
  { name: '논현', emoji: '🍷', district: '강남구' },
  { name: '대치', emoji: '📖', district: '강남구' },
  { name: '도곡', emoji: '🏡', district: '강남구' },
  { name: '개포', emoji: '🌿', district: '강남구' },

  // === 강동구 ===
  { name: '천호', emoji: '🛒', district: '강동구' },
  { name: '길동', emoji: '🏘️', district: '강동구' },
  { name: '둔촌', emoji: '🏗️', district: '강동구' },
  { name: '암사', emoji: '🏺', district: '강동구' },
  { name: '강일', emoji: '🌅', district: '강동구' },

  // === 강북구 ===
  { name: '수유', emoji: '⛰️', district: '강북구' },
  { name: '미아', emoji: '🏠', district: '강북구' },
  { name: '번동', emoji: '🌄', district: '강북구' },

  // === 강서구 ===
  { name: '화곡', emoji: '🏘️', district: '강서구' },
  { name: '등촌', emoji: '🌾', district: '강서구' },
  { name: '발산', emoji: '✈️', district: '강서구' },
  { name: '마곡', emoji: '🔬', district: '강서구' },

  // === 관악구 ===
  { name: '봉천', emoji: '🏔️', district: '관악구' },
  { name: '서울대입구', emoji: '🎓', district: '관악구' },
  { name: '낙성대', emoji: '🏛️', district: '관악구' },

  // === 광진구 ===
  { name: '구의', emoji: '🌉', district: '광진구' },
  { name: '자양동', emoji: '🍜', district: '광진구' },
  { name: '화양동', emoji: '🎶', district: '광진구' },

  // === 구로구 ===
  { name: '구로', emoji: '🏭', district: '구로구' },
  { name: '신도림', emoji: '🚉', district: '구로구' },
  { name: '고척', emoji: '⚾', district: '구로구' },

  // === 금천구 ===
  { name: '가산', emoji: '🖥️', district: '금천구' },
  { name: '독산', emoji: '🏘️', district: '금천구' },

  // === 노원구 ===
  { name: '노원', emoji: '🌳', district: '노원구' },
  { name: '상계', emoji: '📚', district: '노원구' },
  { name: '중계', emoji: '🏫', district: '노원구' },
  { name: '하계', emoji: '🏞️', district: '노원구' },

  // === 도봉구 ===
  { name: '도봉', emoji: '🏔️', district: '도봉구' },
  { name: '쌍문', emoji: '🚶', district: '도봉구' },
  { name: '방학', emoji: '🎒', district: '도봉구' },
  { name: '창동', emoji: '🎵', district: '도봉구' },

  // === 동대문구 ===
  { name: '청량리', emoji: '🚂', district: '동대문구' },
  { name: '회기', emoji: '🎓', district: '동대문구' },
  { name: '이문동', emoji: '📖', district: '동대문구' },
  { name: '장안동', emoji: '🏘️', district: '동대문구' },
  { name: '전농동', emoji: '🌱', district: '동대문구' },

  // === 동작구 ===
  { name: '사당', emoji: '🚇', district: '동작구' },
  { name: '이수', emoji: '🎭', district: '동작구' },
  { name: '노량진', emoji: '📝', district: '동작구' },
  { name: '흑석', emoji: '🏫', district: '동작구' },

  // === 마포구 ===
  { name: '상수', emoji: '🎨', district: '마포구' },
  { name: '상암', emoji: '📺', district: '마포구' },
  { name: '공덕', emoji: '🏢', district: '마포구' },
  { name: '마포', emoji: '🌊', district: '마포구' },

  // === 서대문구 ===
  { name: '이대', emoji: '🌸', district: '서대문구' },
  { name: '연희동', emoji: '🏡', district: '서대문구' },
  { name: '홍제', emoji: '🌉', district: '서대문구' },
  { name: '북아현', emoji: '🏘️', district: '서대문구' },

  // === 서초구 ===
  { name: '서초', emoji: '⚖️', district: '서초구' },
  { name: '방배', emoji: '☕', district: '서초구' },
  { name: '반포', emoji: '🌉', district: '서초구' },
  { name: '잠원', emoji: '🌊', district: '서초구' },
  { name: '양재', emoji: '🌲', district: '서초구' },

  // === 성동구 ===
  { name: '금호', emoji: '🌇', district: '성동구' },
  { name: '옥수', emoji: '🌊', district: '성동구' },
  { name: '행당', emoji: '🏘️', district: '성동구' },

  // === 성북구 ===
  { name: '성북동', emoji: '🏛️', district: '성북구' },
  { name: '한성대', emoji: '🎓', district: '성북구' },
  { name: '길음', emoji: '🚇', district: '성북구' },
  { name: '돈암', emoji: '🏘️', district: '성북구' },
  { name: '정릉', emoji: '🏔️', district: '성북구' },
  { name: '장위', emoji: '🌳', district: '성북구' },

  // === 송파구 ===
  { name: '송파', emoji: '🏙️', district: '송파구' },
  { name: '석촌', emoji: '🌸', district: '송파구' },
  { name: '방이', emoji: '🎾', district: '송파구' },
  { name: '가락', emoji: '🥬', district: '송파구' },
  { name: '문정', emoji: '🏢', district: '송파구' },

  // === 양천구 ===
  { name: '목동', emoji: '🏫', district: '양천구' },
  { name: '신정', emoji: '🏘️', district: '양천구' },

  // === 영등포구 ===
  { name: '영등포', emoji: '🏙️', district: '영등포구' },
  { name: '당산', emoji: '🏢', district: '영등포구' },
  { name: '문래', emoji: '🔨', district: '영등포구' },

  // === 용산구 ===
  { name: '한남동', emoji: '🏡', district: '용산구' },
  { name: '용산', emoji: '🏛️', district: '용산구' },
  { name: '녹사평', emoji: '🌿', district: '용산구' },
  { name: '삼각지', emoji: '🍖', district: '용산구' },
  { name: '후암동', emoji: '🏔️', district: '용산구' },

  // === 은평구 ===
  { name: '불광', emoji: '⛰️', district: '은평구' },
  { name: '응암', emoji: '🏘️', district: '은평구' },
  { name: '역촌', emoji: '🚇', district: '은평구' },
  { name: '녹번', emoji: '🌿', district: '은평구' },

  // === 종로구 ===
  { name: '종로', emoji: '🏛️', district: '종로구' },
  { name: '광화문', emoji: '🏰', district: '종로구' },
  { name: '북촌', emoji: '🏘️', district: '종로구' },
  { name: '삼청동', emoji: '🎨', district: '종로구' },
  { name: '인사동', emoji: '🖼️', district: '종로구' },
  { name: '혜화', emoji: '🎭', district: '종로구' },
  { name: '동대문', emoji: '🧵', district: '종로구' },

  // === 중구 ===
  { name: '을지로', emoji: '🍺', district: '중구' },
  { name: '명동', emoji: '🛍️', district: '중구' },
  { name: '충무로', emoji: '🎬', district: '중구' },
  { name: '약수', emoji: '💧', district: '중구' },

  // === 중랑구 ===
  { name: '상봉', emoji: '🚉', district: '중랑구' },
  { name: '면목', emoji: '🏘️', district: '중랑구' },
  { name: '망우', emoji: '🌄', district: '중랑구' },

  // ============================================================
  // 부산광역시 (구·군 단위)
  // ============================================================
  { name: '해운대구', emoji: '🏖️', district: '부산' },
  { name: '수영구', emoji: '🏊', district: '부산' },
  { name: '부산진구', emoji: '🏙️', district: '부산' },
  { name: '부산 남구', emoji: '⛵', district: '부산' },
  { name: '동래구', emoji: '♨️', district: '부산' },
  { name: '연제구', emoji: '🏢', district: '부산' },
  { name: '사하구', emoji: '🏘️', district: '부산' },
  { name: '부산 북구', emoji: '🌿', district: '부산' },
  { name: '부산 강서구', emoji: '✈️', district: '부산' },
  { name: '금정구', emoji: '⛰️', district: '부산' },
  { name: '사상구', emoji: '🏭', district: '부산' },
  { name: '부산 중구', emoji: '🛍️', district: '부산' },
  { name: '부산 서구', emoji: '🌊', district: '부산' },
  { name: '영도구', emoji: '🌉', district: '부산' },
  { name: '부산 동구', emoji: '⚓', district: '부산' },
  { name: '기장군', emoji: '🐟', district: '부산' },

  // ============================================================
  // 대구광역시 (구·군 단위)
  // ============================================================
  { name: '수성구', emoji: '🏞️', district: '대구' },
  { name: '달서구', emoji: '🏙️', district: '대구' },
  { name: '대구 북구', emoji: '🏢', district: '대구' },
  { name: '대구 동구', emoji: '🌄', district: '대구' },
  { name: '대구 중구', emoji: '🛍️', district: '대구' },
  { name: '대구 서구', emoji: '🏘️', district: '대구' },
  { name: '대구 남구', emoji: '🎓', district: '대구' },
  { name: '달성군', emoji: '🌾', district: '대구' },
  { name: '군위군', emoji: '⛰️', district: '대구' },

  // ============================================================
  // 인천광역시 (구·군 단위)
  // ============================================================
  { name: '남동구', emoji: '🏢', district: '인천' },
  { name: '부평구', emoji: '🎪', district: '인천' },
  { name: '인천 서구', emoji: '🏙️', district: '인천' },
  { name: '연수구', emoji: '📚', district: '인천' },
  { name: '미추홀구', emoji: '🏘️', district: '인천' },
  { name: '계양구', emoji: '⛰️', district: '인천' },
  { name: '인천 중구', emoji: '✈️', district: '인천' },
  { name: '인천 동구', emoji: '🏛️', district: '인천' },
  { name: '강화군', emoji: '🏰', district: '인천' },
  { name: '옹진군', emoji: '🏝️', district: '인천' },

  // ============================================================
  // 광주광역시 (구 단위)
  // ============================================================
  { name: '광주 서구', emoji: '🏢', district: '광주' },
  { name: '광주 북구', emoji: '🎨', district: '광주' },
  { name: '광주 남구', emoji: '🎓', district: '광주' },
  { name: '광산구', emoji: '🏭', district: '광주' },
  { name: '광주 동구', emoji: '🏛️', district: '광주' },

  // ============================================================
  // 대전광역시 (구 단위)
  // ============================================================
  { name: '유성구', emoji: '🔬', district: '대전' },
  { name: '대전 서구', emoji: '🏢', district: '대전' },
  { name: '대전 중구', emoji: '🛍️', district: '대전' },
  { name: '대전 동구', emoji: '🚂', district: '대전' },
  { name: '대덕구', emoji: '🧪', district: '대전' },

  // ============================================================
  // 울산광역시 (구·군 단위)
  // ============================================================
  { name: '울산 남구', emoji: '🏢', district: '울산' },
  { name: '울산 중구', emoji: '🛍️', district: '울산' },
  { name: '울산 북구', emoji: '🏘️', district: '울산' },
  { name: '울산 동구', emoji: '🚢', district: '울산' },
  { name: '울주군', emoji: '🌊', district: '울산' },

  // ============================================================
  // 세종특별자치시
  // ============================================================
  { name: '세종시', emoji: '🏛️', district: '세종' },

  // ============================================================
  // 경기도 (구가 있는 시 → 구 단위)
  // ============================================================

  // === 경기도 수원시 ===
  { name: '장안구', emoji: '🏯', district: '경기도 수원시' },
  { name: '권선구', emoji: '🏘️', district: '경기도 수원시' },
  { name: '팔달구', emoji: '🏪', district: '경기도 수원시' },
  { name: '영통구', emoji: '💻', district: '경기도 수원시' },

  // === 경기도 성남시 ===
  { name: '수정구', emoji: '⛰️', district: '경기도 성남시' },
  { name: '중원구', emoji: '🏢', district: '경기도 성남시' },
  { name: '분당구', emoji: '💻', district: '경기도 성남시' },

  // === 경기도 용인시 ===
  { name: '처인구', emoji: '🌿', district: '경기도 용인시' },
  { name: '기흥구', emoji: '🏢', district: '경기도 용인시' },
  { name: '수지구', emoji: '🏡', district: '경기도 용인시' },

  // === 경기도 고양시 ===
  { name: '덕양구', emoji: '🌳', district: '경기도 고양시' },
  { name: '일산동구', emoji: '🏙️', district: '경기도 고양시' },
  { name: '일산서구', emoji: '🌸', district: '경기도 고양시' },

  // === 경기도 안산시 ===
  { name: '상록구', emoji: '🌲', district: '경기도 안산시' },
  { name: '단원구', emoji: '🎨', district: '경기도 안산시' },

  // === 경기도 안양시 ===
  { name: '만안구', emoji: '🏘️', district: '경기도 안양시' },
  { name: '동안구', emoji: '🏢', district: '경기도 안양시' },

  // ============================================================
  // 강원특별자치도 (시·군 단위)
  // ============================================================
  { name: '춘천시', emoji: '🍗', district: '강원' },
  { name: '원주시', emoji: '🏥', district: '강원' },
  { name: '강릉시', emoji: '☕', district: '강원' },
  { name: '속초시', emoji: '🏖️', district: '강원' },
  { name: '동해시', emoji: '🌊', district: '강원' },
  { name: '태백시', emoji: '⛷️', district: '강원' },
  { name: '삼척시', emoji: '🌊', district: '강원' },
  { name: '홍천군', emoji: '🌲', district: '강원' },
  { name: '횡성군', emoji: '🐄', district: '강원' },
  { name: '영월군', emoji: '⛰️', district: '강원' },
  { name: '평창군', emoji: '🎿', district: '강원' },
  { name: '정선군', emoji: '🎰', district: '강원' },
  { name: '철원군', emoji: '🦅', district: '강원' },
  { name: '화천군', emoji: '🐟', district: '강원' },
  { name: '양구군', emoji: '🌿', district: '강원' },
  { name: '인제군', emoji: '🏔️', district: '강원' },
  { name: '강원 고성군', emoji: '🏖️', district: '강원' },
  { name: '양양군', emoji: '🏄', district: '강원' },

  // ============================================================
  // 충청북도 (시·군 단위)
  // ============================================================
  { name: '청주시', emoji: '🏢', district: '충북' },
  { name: '충주시', emoji: '💧', district: '충북' },
  { name: '제천시', emoji: '🌿', district: '충북' },
  { name: '보은군', emoji: '⛰️', district: '충북' },
  { name: '옥천군', emoji: '🏘️', district: '충북' },
  { name: '영동군', emoji: '🍇', district: '충북' },
  { name: '증평군', emoji: '🌾', district: '충북' },
  { name: '진천군', emoji: '🏭', district: '충북' },
  { name: '괴산군', emoji: '🌶️', district: '충북' },
  { name: '음성군', emoji: '🏢', district: '충북' },
  { name: '단양군', emoji: '🏞️', district: '충북' },

  // ============================================================
  // 충청남도 (시·군 단위)
  // ============================================================
  { name: '천안시', emoji: '🏙️', district: '충남' },
  { name: '아산시', emoji: '♨️', district: '충남' },
  { name: '서산시', emoji: '🌅', district: '충남' },
  { name: '논산시', emoji: '🎖️', district: '충남' },
  { name: '당진시', emoji: '🏭', district: '충남' },
  { name: '공주시', emoji: '🏛️', district: '충남' },
  { name: '보령시', emoji: '🏖️', district: '충남' },
  { name: '계룡시', emoji: '🏛️', district: '충남' },
  { name: '홍성군', emoji: '🐄', district: '충남' },
  { name: '예산군', emoji: '🍎', district: '충남' },
  { name: '태안군', emoji: '🌊', district: '충남' },
  { name: '금산군', emoji: '🌿', district: '충남' },
  { name: '부여군', emoji: '🏯', district: '충남' },
  { name: '서천군', emoji: '🌾', district: '충남' },
  { name: '청양군', emoji: '🌶️', district: '충남' },

  // ============================================================
  // 전북특별자치도 (시·군 단위)
  // ============================================================
  { name: '전주시', emoji: '🍚', district: '전북' },
  { name: '익산시', emoji: '💎', district: '전북' },
  { name: '군산시', emoji: '🏭', district: '전북' },
  { name: '정읍시', emoji: '🌸', district: '전북' },
  { name: '남원시', emoji: '💕', district: '전북' },
  { name: '김제시', emoji: '🌾', district: '전북' },
  { name: '완주군', emoji: '🏔️', district: '전북' },
  { name: '진안군', emoji: '🌿', district: '전북' },
  { name: '무주군', emoji: '🎿', district: '전북' },
  { name: '장수군', emoji: '⛰️', district: '전북' },
  { name: '임실군', emoji: '🧀', district: '전북' },
  { name: '순창군', emoji: '🫘', district: '전북' },
  { name: '고창군', emoji: '🏰', district: '전북' },
  { name: '부안군', emoji: '🌊', district: '전북' },

  // ============================================================
  // 전라남도 (시·군 단위)
  // ============================================================
  { name: '목포시', emoji: '🌊', district: '전남' },
  { name: '여수시', emoji: '🌉', district: '전남' },
  { name: '순천시', emoji: '🌿', district: '전남' },
  { name: '나주시', emoji: '🍐', district: '전남' },
  { name: '광양시', emoji: '🏭', district: '전남' },
  { name: '담양군', emoji: '🎋', district: '전남' },
  { name: '곡성군', emoji: '🚂', district: '전남' },
  { name: '구례군', emoji: '🌸', district: '전남' },
  { name: '고흥군', emoji: '🚀', district: '전남' },
  { name: '보성군', emoji: '🍵', district: '전남' },
  { name: '화순군', emoji: '⛰️', district: '전남' },
  { name: '장흥군', emoji: '🐄', district: '전남' },
  { name: '강진군', emoji: '🏺', district: '전남' },
  { name: '해남군', emoji: '🌅', district: '전남' },
  { name: '영암군', emoji: '🏎️', district: '전남' },
  { name: '무안군', emoji: '✈️', district: '전남' },
  { name: '함평군', emoji: '🦋', district: '전남' },
  { name: '영광군', emoji: '🐟', district: '전남' },
  { name: '장성군', emoji: '📚', district: '전남' },
  { name: '완도군', emoji: '🏝️', district: '전남' },
  { name: '진도군', emoji: '🌊', district: '전남' },
  { name: '신안군', emoji: '🏝️', district: '전남' },

  // ============================================================
  // 경상북도 (시·군 단위)
  // ============================================================
  { name: '포항시', emoji: '🐟', district: '경북' },
  { name: '경주시', emoji: '🏛️', district: '경북' },
  { name: '구미시', emoji: '📱', district: '경북' },
  { name: '김천시', emoji: '🍇', district: '경북' },
  { name: '안동시', emoji: '🏘️', district: '경북' },
  { name: '영주시', emoji: '🏔️', district: '경북' },
  { name: '영천시', emoji: '♨️', district: '경북' },
  { name: '상주시', emoji: '🍑', district: '경북' },
  { name: '문경시', emoji: '⛰️', district: '경북' },
  { name: '경산시', emoji: '🎓', district: '경북' },
  { name: '의성군', emoji: '🧄', district: '경북' },
  { name: '청송군', emoji: '🍎', district: '경북' },
  { name: '영양군', emoji: '🌶️', district: '경북' },
  { name: '영덕군', emoji: '🦀', district: '경북' },
  { name: '청도군', emoji: '🐂', district: '경북' },
  { name: '고령군', emoji: '🏺', district: '경북' },
  { name: '성주군', emoji: '🍈', district: '경북' },
  { name: '칠곡군', emoji: '🏘️', district: '경북' },
  { name: '예천군', emoji: '🌳', district: '경북' },
  { name: '봉화군', emoji: '🌲', district: '경북' },
  { name: '울진군', emoji: '🌊', district: '경북' },
  { name: '울릉군', emoji: '🏝️', district: '경북' },

  // ============================================================
  // 경상남도 (시·군 단위)
  // ============================================================
  { name: '창원시', emoji: '🏙️', district: '경남' },
  { name: '진주시', emoji: '🏯', district: '경남' },
  { name: '통영시', emoji: '🎨', district: '경남' },
  { name: '사천시', emoji: '✈️', district: '경남' },
  { name: '김해시', emoji: '🏛️', district: '경남' },
  { name: '밀양시', emoji: '🌊', district: '경남' },
  { name: '거제시', emoji: '🚢', district: '경남' },
  { name: '양산시', emoji: '⛰️', district: '경남' },
  { name: '의령군', emoji: '🌾', district: '경남' },
  { name: '함안군', emoji: '🌸', district: '경남' },
  { name: '창녕군', emoji: '🐦', district: '경남' },
  { name: '경남 고성군', emoji: '🦕', district: '경남' },
  { name: '남해군', emoji: '🏝️', district: '경남' },
  { name: '하동군', emoji: '🍵', district: '경남' },
  { name: '산청군', emoji: '🌿', district: '경남' },
  { name: '함양군', emoji: '⛰️', district: '경남' },
  { name: '거창군', emoji: '🏔️', district: '경남' },
  { name: '합천군', emoji: '🏛️', district: '경남' },

  // ============================================================
  // 제주특별자치도 (시 단위)
  // ============================================================
  { name: '제주시', emoji: '🏝️', district: '제주' },
  { name: '서귀포시', emoji: '🍊', district: '제주' },
]

// 인접 동네 매핑 (서울)
export const NEARBY_REGIONS_MAP: Record<string, string[]> = {
  '성수동': ['건대', '왕십리', '서울숲', '잠실', '금호', '옥수'],
  '홍대': ['합정', '신촌', '연남동', '망원동', '상수'],
  '강남': ['압구정', '선릉', '신사', '역삼', '삼성', '논현'],
  '신촌': ['홍대', '이대', '연희동', '합정'],
  '이태원': ['한남동', '용산', '녹사평', '삼각지'],
  '건대': ['성수동', '왕십리', '자양동', '화양동', '구의'],
  '잠실': ['성수동', '송파', '천호', '석촌', '방이'],
  '여의도': ['영등포', '당산', '마포', '공덕'],
  '망원동': ['합정', '홍대', '연남동', '상암'],
  '연남동': ['홍대', '합정', '망원동', '상수'],
  '합정': ['홍대', '망원동', '상수', '연남동'],
  '서울숲': ['성수동', '왕십리', '압구정', '금호'],
  '압구정': ['강남', '청담', '서울숲', '신사'],
  '선릉': ['강남', '역삼', '삼성', '대치'],
  '신림': ['봉천', '서울대입구', '낙성대', '사당'],
  '왕십리': ['성수동', '건대', '행당', '청량리'],
  '역삼': ['강남', '선릉', '삼성', '논현'],
  '삼성': ['강남', '선릉', '역삼', '청담', '잠실'],
  '청담': ['압구정', '삼성', '신사'],
  '신사': ['강남', '압구정', '논현', '청담'],
  '논현': ['강남', '신사', '역삼'],
  '대치': ['선릉', '도곡', '삼성'],
  '도곡': ['대치', '개포', '양재'],
  '개포': ['도곡', '양재', '대치'],
  '천호': ['잠실', '길동', '둔촌', '강일'],
  '길동': ['천호', '둔촌', '암사'],
  '둔촌': ['천호', '길동', '암사'],
  '암사': ['길동', '둔촌', '강일'],
  '강일': ['암사', '천호'],
  '수유': ['미아', '번동', '쌍문'],
  '미아': ['수유', '번동', '길음'],
  '번동': ['수유', '미아'],
  '화곡': ['등촌', '발산', '목동'],
  '등촌': ['화곡', '발산', '마곡'],
  '발산': ['화곡', '등촌', '마곡'],
  '마곡': ['발산', '등촌'],
  '봉천': ['신림', '서울대입구', '낙성대', '사당'],
  '서울대입구': ['신림', '봉천', '낙성대'],
  '낙성대': ['봉천', '서울대입구', '사당'],
  '구의': ['건대', '자양동', '화양동'],
  '자양동': ['건대', '구의', '화양동'],
  '화양동': ['건대', '구의', '자양동'],
  '구로': ['신도림', '고척', '가산'],
  '신도림': ['구로', '영등포', '당산', '문래'],
  '고척': ['구로', '목동'],
  '가산': ['구로', '독산'],
  '독산': ['가산', '구로'],
  '노원': ['상계', '중계', '하계', '창동'],
  '상계': ['노원', '중계', '하계'],
  '중계': ['노원', '상계', '하계'],
  '하계': ['노원', '상계', '중계'],
  '도봉': ['쌍문', '방학', '창동'],
  '쌍문': ['도봉', '수유', '방학'],
  '방학': ['도봉', '쌍문', '창동'],
  '창동': ['도봉', '방학', '노원'],
  '청량리': ['왕십리', '회기', '이문동'],
  '회기': ['청량리', '이문동'],
  '이문동': ['회기', '청량리'],
  '장안동': ['전농동', '청량리'],
  '전농동': ['장안동', '청량리'],
  '사당': ['이수', '봉천', '낙성대', '방배'],
  '이수': ['사당', '노량진'],
  '노량진': ['이수', '영등포', '흑석'],
  '흑석': ['노량진', '이수'],
  '상수': ['합정', '홍대', '마포'],
  '상암': ['망원동', '공덕', '마포'],
  '공덕': ['여의도', '마포', '상암'],
  '마포': ['공덕', '상수', '상암'],
  '이대': ['신촌', '연희동', '홍대'],
  '연희동': ['신촌', '이대', '홍제'],
  '홍제': ['연희동', '북아현'],
  '북아현': ['홍제', '신촌'],
  '서초': ['방배', '반포', '양재', '강남'],
  '방배': ['서초', '사당', '반포'],
  '반포': ['서초', '방배', '잠원'],
  '잠원': ['반포', '압구정', '서울숲'],
  '양재': ['서초', '도곡', '개포'],
  '금호': ['성수동', '옥수', '행당', '약수'],
  '옥수': ['금호', '성수동', '한남동'],
  '행당': ['왕십리', '금호', '성수동'],
  '성북동': ['한성대', '혜화', '삼청동', '북촌'],
  '한성대': ['성북동', '혜화', '돈암'],
  '길음': ['미아', '돈암', '정릉'],
  '돈암': ['길음', '한성대', '정릉'],
  '정릉': ['길음', '돈암', '장위'],
  '장위': ['정릉', '상계'],
  '송파': ['잠실', '석촌', '방이', '가락', '문정'],
  '석촌': ['잠실', '송파', '방이'],
  '방이': ['잠실', '송파', '석촌'],
  '가락': ['송파', '문정'],
  '문정': ['송파', '가락', '잠실'],
  '목동': ['신정', '화곡', '고척'],
  '신정': ['목동', '화곡'],
  '영등포': ['여의도', '당산', '문래', '신도림'],
  '당산': ['영등포', '여의도', '문래'],
  '문래': ['영등포', '당산', '신도림'],
  '한남동': ['이태원', '용산', '옥수'],
  '용산': ['이태원', '한남동', '녹사평', '삼각지', '후암동'],
  '녹사평': ['이태원', '용산'],
  '삼각지': ['용산', '후암동'],
  '후암동': ['용산', '삼각지'],
  '불광': ['응암', '역촌', '녹번'],
  '응암': ['불광', '역촌'],
  '역촌': ['불광', '응암', '녹번'],
  '녹번': ['불광', '역촌'],
  '종로': ['광화문', '인사동', '을지로', '동대문'],
  '광화문': ['종로', '삼청동', '북촌'],
  '북촌': ['삼청동', '광화문', '혜화', '성북동'],
  '삼청동': ['북촌', '광화문', '인사동'],
  '인사동': ['종로', '삼청동', '을지로'],
  '혜화': ['성북동', '북촌', '종로'],
  '동대문': ['종로', '을지로', '청량리'],
  '을지로': ['종로', '명동', '동대문', '인사동'],
  '명동': ['을지로', '충무로'],
  '충무로': ['명동', '을지로', '약수'],
  '약수': ['충무로', '금호'],
  '상봉': ['면목', '망우', '중계'],
  '면목': ['상봉', '망우'],
  '망우': ['상봉', '면목'],
}

/**
 * 전체 동네 목록 반환 (인기지역 상단)
 */
export function getAllRegions(): RegionData[] {
  return ALL_REGIONS
}

/**
 * 인기 동네 목록만 반환
 */
export function getPopularRegions(): RegionData[] {
  return POPULAR
}

/**
 * 동네 이름 목록만 반환
 */
export function getAllRegionNames(): string[] {
  return ALL_REGIONS.map((r) => r.name)
}

/**
 * 동네 검색 (이름 또는 지역명으로 검색, 인기지역 우선)
 */
export function searchRegions(query: string): RegionData[] {
  if (!query.trim()) return ALL_REGIONS

  const q = query.trim().toLowerCase()
  const matched = ALL_REGIONS.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.district.toLowerCase().includes(q)
  )

  // 인기지역 우선 정렬
  return matched.sort((a, b) => {
    if (a.popular && !b.popular) return -1
    if (!a.popular && b.popular) return 1
    return 0
  })
}

/**
 * 동네 이름으로 RegionData 찾기
 */
export function findRegion(name: string): RegionData | undefined {
  return ALL_REGIONS.find((r) => r.name === name)
}

/**
 * 인접 동네 목록 반환
 */
export function getNearbyRegions(regionName: string): string[] {
  return NEARBY_REGIONS_MAP[regionName] || []
}
