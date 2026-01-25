import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardBadges } from '@/lib/badges'
import { calculateLevel } from '@/lib/utils'

// GET /api/meetings/[id] - 모임 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            level: true,
            meetingCount: true,
            hostCount: true,
            likeReceived: true,
          },
        },
        participants: {
          where: {
            status: {
              not: 'CANCELLED',
            },
          },
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                profileImage: true,
                level: true,
              },
            },
          },
        },
        gameRoles: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                profileImage: true,
              },
            },
          },
        },
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

    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Failed to fetch meeting:', error)
    return NextResponse.json(
      { message: '모임을 불러오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// PUT /api/meetings/[id] - 모임 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    if (meeting.hostId !== session.user.id) {
      return NextResponse.json({ message: '권한이 없습니다' }, { status: 403 })
    }

    // 상태가 COMPLETED로 변경되는 경우 참여자들 처리
    const isCompletingMeeting = body.status === 'COMPLETED' && meeting.status !== 'COMPLETED'

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        gameType: body.gameType,
        meetingDate: body.meetingDate ? new Date(body.meetingDate) : undefined,
        duration: body.duration,
        placeName: body.placeName,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        maxParticipants: body.maxParticipants,
        minLevel: body.minLevel,
        status: body.status,
      },
      include: {
        participants: {
          where: { status: { not: 'CANCELLED' } },
        },
      },
    })

    // 모임 완료 시 참여자들 처리
    if (isCompletingMeeting) {
      const participantIds = updatedMeeting.participants.map((p: { userId: string }) => p.userId)
      const allUserIds = [meeting.hostId, ...participantIds]

      // 참여자들 상태를 ATTENDED로 변경하고 meetingCount, exp 증가
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await prisma.$transaction(async (tx: any) => {
        // 참여 상태 업데이트
        await tx.participant.updateMany({
          where: {
            meetingId: id,
            status: { not: 'CANCELLED' },
          },
          data: { status: 'ATTENDED' },
        })

        // 모든 참여자 meetingCount, exp 증가
        for (const userId of allUserIds) {
          const user = await tx.user.update({
            where: { id: userId },
            data: {
              meetingCount: { increment: 1 },
              exp: { increment: 10 },
            },
          })

          // 레벨 업 확인
          const newLevel = calculateLevel(user.exp)
          if (newLevel > user.level) {
            await tx.user.update({
              where: { id: userId },
              data: { level: newLevel },
            })
          }
        }
      })

      // 뱃지 체크 (트랜잭션 외부에서 비동기로 실행)
      Promise.all(allUserIds.map((userId) => checkAndAwardBadges(userId))).catch(
        (error) => console.error('Failed to check badges:', error)
      )
    }

    return NextResponse.json(updatedMeeting)
  } catch (error) {
    console.error('Failed to update meeting:', error)
    return NextResponse.json(
      { message: '모임 수정에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/meetings/[id] - 모임 삭제
export async function DELETE(
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
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    if (meeting.hostId !== session.user.id) {
      return NextResponse.json({ message: '권한이 없습니다' }, { status: 403 })
    }

    // 트랜잭션으로 모임 삭제 및 hostCount 차감
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      // 모임 삭제
      await tx.meeting.delete({
        where: { id },
      })

      // 완료되지 않은 모임이면 hostCount 차감
      if (meeting.status !== 'COMPLETED') {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            hostCount: {
              decrement: 1,
            },
          },
        })
      }
    })

    return NextResponse.json({ message: '모임이 삭제되었습니다' })
  } catch (error) {
    console.error('Failed to delete meeting:', error)
    return NextResponse.json(
      { message: '모임 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
