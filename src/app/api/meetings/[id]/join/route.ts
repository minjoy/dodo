import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/meetings/[id]/join - 모임 참여
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id: meetingId } = await params
    const userId = session.user.id
    const body = await request.json().catch(() => ({}))
    const { password } = body

    // 모임 조회
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        _count: {
          select: {
            participants: {
              where: {
                status: {
                  not: 'CANCELLED',
                },
              },
            },
          },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    // 비밀번호 확인
    if (meeting.password && meeting.password !== password) {
      return NextResponse.json(
        { message: '비밀번호가 올바르지 않습니다' },
        { status: 400 }
      )
    }

    // 호스트는 참여 불가
    if (meeting.hostId === userId) {
      return NextResponse.json(
        { message: '호스트는 이미 참여 중입니다' },
        { status: 400 }
      )
    }

    // 모집중 상태 확인
    if (meeting.status !== 'RECRUITING') {
      return NextResponse.json(
        { message: '모집이 마감된 모임입니다' },
        { status: 400 }
      )
    }

    // 인원 확인
    if (meeting._count.participants >= meeting.maxParticipants) {
      return NextResponse.json(
        { message: '모집 인원이 가득 찼습니다' },
        { status: 400 }
      )
    }

    // 레벨 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || user.level < meeting.minLevel) {
      return NextResponse.json(
        { message: `레벨 ${meeting.minLevel} 이상만 참여할 수 있습니다` },
        { status: 400 }
      )
    }

    // 이미 참여 중인지 확인
    const existingParticipant = await prisma.participant.findUnique({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
    })

    if (existingParticipant && existingParticipant.status !== 'CANCELLED') {
      return NextResponse.json(
        { message: '이미 참여 중인 모임입니다' },
        { status: 400 }
      )
    }

    // 참여 처리
    if (existingParticipant) {
      // 취소했던 참여 다시 활성화
      await prisma.participant.update({
        where: { id: existingParticipant.id },
        data: { status: 'CONFIRMED' },
      })
    } else {
      // 새로 참여
      await prisma.participant.create({
        data: {
          meetingId,
          userId,
          status: 'CONFIRMED',
        },
      })
    }

    // 모집 완료 확인
    const updatedCount = meeting._count.participants + 1
    if (updatedCount >= meeting.maxParticipants) {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'FULL' },
      })
    }

    return NextResponse.json({ message: '참여가 완료되었습니다' })
  } catch (error) {
    console.error('Failed to join meeting:', error)
    return NextResponse.json(
      { message: '참여 처리에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/meetings/[id]/join - 참여 취소
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id: meetingId } = await params
    const userId = session.user.id

    const participant = await prisma.participant.findUnique({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
    })

    if (!participant || participant.status === 'CANCELLED') {
      return NextResponse.json(
        { message: '참여 중인 모임이 아닙니다' },
        { status: 400 }
      )
    }

    // 참여 취소
    await prisma.participant.update({
      where: { id: participant.id },
      data: { status: 'CANCELLED' },
    })

    // 모집중으로 상태 변경 (FULL이었던 경우)
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'RECRUITING' },
    })

    return NextResponse.json({ message: '참여가 취소되었습니다' })
  } catch (error) {
    console.error('Failed to leave meeting:', error)
    return NextResponse.json(
      { message: '참여 취소에 실패했습니다' },
      { status: 500 }
    )
  }
}
