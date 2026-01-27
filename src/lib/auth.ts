import { NextAuthOptions } from 'next-auth'
import KakaoProvider from 'next-auth/providers/kakao'
import { prisma } from './prisma'

// 성인 최소 나이
const ADULT_MIN_AGE = 20

export const authOptions: NextAuthOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'account_email gender birthyear',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'kakao' && profile) {
        const kakaoProfile = profile as {
          id: number
          kakao_account?: {
            email?: string
            gender?: string // "male" 또는 "female"
            birthyear?: string // 예: "1990"
          }
        }

        const kakaoId = String(kakaoProfile.id)
        const email = kakaoProfile.kakao_account?.email
        const gender = kakaoProfile.kakao_account?.gender // "male" 또는 "female"
        const birthYear = kakaoProfile.kakao_account?.birthyear // 예: "1990"
        // 닉네임은 온보딩에서 설정, 임시로 고유한 값 사용
        const nickname = `user_${kakaoId.slice(-8)}`

        // 1. 영구 정지된 카카오 계정인지 확인
        const bannedKakao = await prisma.bannedKakao.findUnique({
          where: { kakaoId },
        })
        if (bannedKakao) {
          // 영구 정지된 계정 - 로그인 거부
          return '/login?error=banned'
        }

        // 2. 기존 사용자 확인
        const existingUser = await prisma.user.findUnique({
          where: { kakaoId },
        })

        if (existingUser) {
          // 정지된 계정인지 확인
          if (existingUser.isBanned) {
            return '/login?error=suspended'
          }
        } else {
          // 3. 신규 가입 시 성인 인증 확인 (출생년도 기준)
          const currentYear = new Date().getFullYear()
          const age = birthYear ? currentYear - parseInt(birthYear) : 0
          if (!birthYear || age < ADULT_MIN_AGE) {
            // 20세 미만 - 가입 거부
            return '/login?error=underage'
          }

          // 새 사용자 생성 (온보딩 필요)
          await prisma.user.create({
            data: {
              kakaoId,
              email,
              nickname,
              gender,
              birthYear,
              region: '', // 온보딩에서 설정
            },
          })
        }
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'kakao' && profile) {
        const kakaoProfile = profile as { id: number }
        token.kakaoId = String(kakaoProfile.id)
      }
      return token
    },
    async session({ session, token }) {
      if (token.kakaoId) {
        const user = await prisma.user.findUnique({
          where: { kakaoId: token.kakaoId as string },
        })
        if (user) {
          // 정지된 계정이면 세션에 표시
          if (user.isBanned) {
            session.user = {
              ...session.user,
              id: user.id,
              kakaoId: user.kakaoId,
              nickname: user.nickname,
              isBanned: true,
            }
          } else {
            session.user = {
              ...session.user,
              id: user.id,
              kakaoId: user.kakaoId,
              nickname: user.nickname,
              profileImage: user.profileImage,
              region: user.region,
              level: user.level,
            }
          }
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
