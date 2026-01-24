import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      kakaoId: string
      nickname: string
      profileImage?: string | null
      region: string
      level: number
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    kakaoId?: string
  }
}
