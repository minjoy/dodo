# 경도 (Gyeongdo)

**동네 기반 오프라인 게임 모임 플랫폼**

> 회사 빼고 친구 만드는 법 - 어른들의 경찰과 도둑

## 프로젝트 소개

경도는 2030 직장인들이 동네에서 추억의 놀이(경찰과 도둑, 술래잡기 등)를 함께하며 자연스럽게 친구를 만들 수 있는 플랫폼입니다.

## 기술 스택

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Zustand
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL (AWS RDS)
- **Authentication**: NextAuth.js (카카오 로그인)
- **Infrastructure**: AWS EC2

## 시작하기

### 1. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Database
DATABASE_URL="mysql://[사용자]:[비밀번호]@[호스트]:3306/gyeongdo"

# NextAuth
NEXTAUTH_URL="https://www.supercost.co.kr"
NEXTAUTH_SECRET="[랜덤 시크릿]"

# Kakao OAuth
KAKAO_CLIENT_ID="[카카오 REST API 키]"
KAKAO_CLIENT_SECRET="[카카오 시크릿]"

# Kakao Map
NEXT_PUBLIC_KAKAO_MAP_API_KEY="[카카오맵 JavaScript 키]"
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

## 배포

### EC2 서버 설정

```bash
# EC2 서버 접속
ssh ec2-user@16.184.8.8

# 프로젝트 클론
cd /home/ec2-user
git clone [repository-url] gyeongdo
cd gyeongdo

# 환경 변수 설정
cp .env.example .env
nano .env  # 실제 값으로 수정

# 의존성 설치 및 빌드
npm install
npm run build

# PM2로 실행
pm2 start npm --name "gyeongdo" -- start
pm2 save
```

## 주요 기능

- 카카오 로그인
- 동네 기반 모임 탐색
- 다양한 게임 종류 (경찰과 도둑, 술래잡기, 무궁화, 피구 등)
- 모임 개설 및 참여
- 레벨 시스템 (새싹 - 전설)
- 참여자 평가 및 좋아요

## 라이선스

Private
