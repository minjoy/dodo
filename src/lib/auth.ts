import { NextAuthOptions } from 'next-auth'
import KakaoProvider from 'next-auth/providers/kakao'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'kakao' && profile) {
        const kakaoProfile = profile as {
          id: number
          kakao_account?: {
            email?: string
            profile?: {
              nickname?: string
              profile_image_url?: string
            }
          }
        }

        const kakaoId = String(kakaoProfile.id)
        const email = kakaoProfile.kakao_account?.email
        const nickname = kakaoProfile.kakao_account?.profile?.nickname || '익명'
        const profileImage = kakaoProfile.kakao_account?.profile?.profile_image_url

        // 기존 사용자 확인 또는 생성
        const existingUser = await prisma.user.findUnique({
          where: { kakaoId },
        })

        if (!existingUser) {
          // 새 사용자 생성 (온보딩 필요)
          await prisma.user.create({
            data: {
              kakaoId,
              email,
              nickname,
              profileImage,
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
