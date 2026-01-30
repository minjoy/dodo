import { NextAuthOptions } from 'next-auth'
import KakaoProvider from 'next-auth/providers/kakao'
import { prisma } from './prisma'
import { errorLogger } from './error-logger'

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
          prompt: 'login',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'kakao' && profile) {
        try {
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
              // 기간 정지인 경우 만료 여부 확인
              if (existingUser.bannedUntil) {
                const now = new Date()
                if (new Date(existingUser.bannedUntil) <= now) {
                  // 정지 기간이 만료되었으면 자동 해제
                  await prisma.user.update({
                    where: { kakaoId },
                    data: {
                      isBanned: false,
                      bannedAt: null,
                      bannedUntil: null,
                      banReason: null,
                    },
                  })
                }
                // 기간 정지 사용자는 로그인 허용 (앱 내에서 제한)
              } else {
                // bannedUntil이 null이면 영구 정지 → 로그인 차단
                return '/login?error=suspended'
              }
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
        } catch (error) {
          errorLogger.capture('Auth/signIn', error)
          // DB 에러 시에도 로그인은 허용 (세션에서 처리)
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
        try {
          const user = await prisma.user.findUnique({
            where: { kakaoId: token.kakaoId as string },
          })
          if (user) {
            // 정지된 계정이면 세션에 표시
            if (user.isBanned) {
              // 기간 정지의 경우 만료 여부 체크
              if (user.bannedUntil && new Date(user.bannedUntil) <= new Date()) {
                // 정지 기간 만료 → 자동 해제
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    isBanned: false,
                    bannedAt: null,
                    bannedUntil: null,
                    banReason: null,
                  },
                })
                session.user = {
                  ...session.user,
                  id: user.id,
                  kakaoId: user.kakaoId,
                  nickname: user.nickname,
                  profileImage: user.profileImage,
                  region: user.region,
                  level: user.level,
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
                  isBanned: true,
                  bannedUntil: user.bannedUntil?.toISOString() || null,
                }
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
        } catch (error) {
          errorLogger.capture('Auth/session', error)
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
    error: '/auth-error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
