import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface ParticipantWithUser {
  id: string
  userId: string
  isReady: boolean
  votedHostNoShow: boolean
  user: {
    id: string
    nickname: string
  }
}

interface ParticipantBasic {
  id: string
  userId: string
  isReady: boolean
  votedHostNoShow: boolean
}

// POST /api/meetings/[id]/host-noshow-vote - 호스트 노쇼 투표
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id } = await params

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: {
          where: { status: { not: 'CANCELLED' } },
          include: { user: true },
          orderBy: { joinedAt: 'asc' },
        },
        host: true,
      },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    // 시작시간이 지났는지 확인
    const now = new Date()
    const meetingDate = new Date(meeting.meetingDate)
    if (now < meetingDate) {
      return NextResponse.json({ message: '모임 시작시간이 지난 후에 투표할 수 있습니다' }, { status: 400 })
    }

    // 호스트는 투표 불가
    if (meeting.hostId === session.user.id) {
      return NextResponse.json({ message: '호스트는 노쇼 투표를 할 수 없습니다' }, { status: 403 })
    }

    // 참가자인지 확인
    const myParticipation = meeting.participants.find((p: ParticipantWithUser) => p.userId === session.user.id)
    if (!myParticipation) {
      return NextResponse.json({ message: '모임 참가자만 투표할 수 있습니다' }, { status: 403 })
    }

    // 출쳌한 참가자만 투표 가능
    if (!myParticipation.isReady) {
      return NextResponse.json({ message: '출쳌한 참가자만 투표할 수 있습니다' }, { status: 403 })
    }

    // 호스트 제외한 출쳌 유저가 1명 이상인지 확인
    const nonHostReadyParticipants = meeting.participants.filter((p: ParticipantWithUser) => p.isReady && p.userId !== meeting.hostId)
    if (nonHostReadyParticipants.length === 0) {
      return NextResponse.json({ message: '출쳌한 참가자가 없습니다' }, { status: 400 })
    }

    // 이미 투표했는지 확인
    if (myParticipation.votedHostNoShow) {
      return NextResponse.json({ message: '이미 투표하셨습니다' }, { status: 400 })
    }

    // 투표 처리
    await prisma.participant.update({
      where: { id: myParticipation.id },
      data: { votedHostNoShow: true },
    })

    // 투표 현황 계산 (호스트 제외한 전체 참가자 대비)
    const nonHostParticipants = meeting.participants.filter((p: ParticipantWithUser) => p.userId !== meeting.hostId)
    const totalVoters = nonHostParticipants.length
    const currentVotes = nonHostParticipants.filter((p: ParticipantWithUser) => p.votedHostNoShow).length + 1 // +1은 방금 투표한 사람
    const votePercentage = (currentVotes / totalVoters) * 100

    // 50% 이상이면 호스트 변경
    if (votePercentage >= 50) {
      // 출쳌한 유저 중 가장 먼저 참여한 사람 (호스트 제외)
      const newHost = nonHostReadyParticipants[0]

      if (newHost) {
        const oldHostId = meeting.hostId

        // 기존 호스트가 participants 테이블에 있는지 확인
        const oldHostParticipation = meeting.participants.find((p: ParticipantWithUser) => p.userId === oldHostId)

        // 기존 호스트가 participants 테이블에 없으면 추가 (일반 참여자로)
        if (!oldHostParticipation) {
          await prisma.participant.create({
            data: {
              meetingId: id,
              userId: oldHostId,
              status: 'JOINED',
              isReady: false,
              votedHostNoShow: false,
            },
          })
        }

        // 호스트 변경
        await prisma.meeting.update({
          where: { id },
          data: { hostId: newHost.userId },
        })

        // 모든 노쇼 투표 초기화
        await prisma.participant.updateMany({
          where: { meetingId: id },
          data: { votedHostNoShow: false },
        })

        return NextResponse.json({
          success: true,
          hostChanged: true,
          newHostId: newHost.userId,
          newHostNickname: newHost.user.nickname,
          message: `호스트가 ${newHost.user.nickname}님으로 변경되었습니다`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      hostChanged: false,
      currentVotes,
      totalVoters,
      votePercentage: Math.round(votePercentage),
      requiredPercentage: 50,
    })
  } catch (error) {
    console.error('Failed to vote host noshow:', error)
    return NextResponse.json(
      { message: '투표에 실패했습니다' },
      { status: 500 }
    )
  }
}

// GET /api/meetings/[id]/host-noshow-vote - 투표 현황 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id } = await params

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        participants: {
          where: { status: { not: 'CANCELLED' } },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    const nonHostParticipants = meeting.participants.filter((p: ParticipantBasic) => p.userId !== meeting.hostId)
    const totalVoters = nonHostParticipants.length
    const currentVotes = nonHostParticipants.filter((p: ParticipantBasic) => p.votedHostNoShow).length
    const myParticipation = meeting.participants.find((p: ParticipantBasic) => p.userId === session.user.id)

    return NextResponse.json({
      currentVotes,
      totalVoters,
      votePercentage: totalVoters > 0 ? Math.round((currentVotes / totalVoters) * 100) : 0,
      requiredPercentage: 50,
      hasVoted: myParticipation?.votedHostNoShow || false,
    })
  } catch (error) {
    console.error('Failed to get vote status:', error)
    return NextResponse.json(
      { message: '투표 현황 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
