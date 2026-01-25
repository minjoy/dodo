export type GameType = 'GYEONGDO' | 'SULRAE' | 'MUGUNGHWA' | 'PIGU' | 'OTHER'

export type MeetingStatus = 'RECRUITING' | 'CLOSED' | 'READY' | 'PLAYING' | 'COMPLETED' | 'CANCELLED'

export type ParticipantStatus = 'PENDING' | 'CONFIRMED' | 'ATTENDED' | 'NOSHOW' | 'CANCELLED'

export interface User {
  id: string
  kakaoId: string
  email?: string | null
  nickname: string
  profileImage?: string | null
  bio?: string | null
  region: string
  regionCode?: string | null
  level: number
  exp: number
  meetingCount: number
  hostCount: number
  likeReceived: number
  noShowCount: number
  representativeBadgeId?: string | null
  representativeBadge?: Badge | null
  representativeBadge2Id?: string | null
  representativeBadge2?: Badge | null
  createdAt: Date
  updatedAt: Date
}

export interface Meeting {
  id: string
  shareCode: string
  title: string
  description?: string | null
  gameType: GameType
  meetingDate: Date
  duration: number
  region: string
  placeName: string
  address: string
  latitude: number
  longitude: number
  maxParticipants: number
  minLevel: number
  password?: string | null
  status: MeetingStatus
  createdAt: Date
  updatedAt: Date
  hostId: string
  host?: User
  participants?: Participant[]
  _count?: {
    participants: number
  }
}

export interface Participant {
  id: string
  status: ParticipantStatus
  joinedAt: Date
  attendedAt?: Date | null
  meetingId: string
  userId: string
  user?: User
  meeting?: Meeting
}

export interface Review {
  id: string
  rating: number
  comment?: string | null
  isLike: boolean
  createdAt: Date
  meetingId: string
  reviewerId: string
  revieweeId: string
  reviewer?: User
  reviewee?: User
  meeting?: Meeting
}

export interface Badge {
  id: string
  code: string
  name: string
  description: string
  icon: string
}

export interface UserBadge {
  id: string
  earnedAt: Date
  userId: string
  badgeId: string
  badge?: Badge
}

export interface MeetingWithDetails extends Meeting {
  host: User
  participants: (Participant & { user: User })[]
  _count: {
    participants: number
  }
}

export interface CreateMeetingInput {
  title: string
  description?: string
  gameType: GameType
  meetingDate: string
  duration: number
  region: string
  placeName: string
  address: string
  latitude: number
  longitude: number
  maxParticipants: number
  minLevel: number
}

export interface UpdateUserInput {
  nickname?: string
  bio?: string
  region?: string
  regionCode?: string
  profileImage?: string
}

export interface CreateReviewInput {
  meetingId: string
  revieweeId: string
  rating: number
  comment?: string
  isLike: boolean
}
