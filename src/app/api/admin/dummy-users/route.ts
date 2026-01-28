import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ADMIN_EMAILS = ['admin@gyeongdo.com', process.env.ADMIN_EMAIL].filter(Boolean)

const isAdmin = (email?: string | null) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}

// GET /api/admin/dummy-users - 더미 사용자 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const dummyUsers = await prisma.user.findMany({
      where: { isDummy: true },
      select: {
        id: true,
        nickname: true,
        region: true,
        level: true,
        exp: true,
        meetingCount: true,
        hostCount: true,
        likeReceived: true,
        noShowCount: true,
        createdAt: true,
        _count: {
          select: { badges: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      count: dummyUsers.length,
      users: dummyUsers,
    })
  } catch (error) {
    console.error('Failed to fetch dummy users:', error)
    return NextResponse.json(
      { message: '더미 사용자 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/dummy-users - 더미 사용자 일괄 삭제
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const dummyUsers = await prisma.user.findMany({
      where: { isDummy: true },
      select: { id: true, nickname: true },
    })

    if (dummyUsers.length === 0) {
      return NextResponse.json({ message: '삭제할 더미 사용자가 없습니다', deletedCount: 0 })
    }

    const dummyUserIds = dummyUsers.map(u => u.id)

    // 관련 데이터 삭제 (FK 순서: 자식 → 부모)
    await prisma.pushSubscription.deleteMany({ where: { userId: { in: dummyUserIds } } })
    await prisma.shout.deleteMany({ where: { userId: { in: dummyUserIds } } })
    await prisma.meetingComment.deleteMany({ where: { userId: { in: dummyUserIds } } })
    await prisma.gameRole.deleteMany({ where: { userId: { in: dummyUserIds } } })
    await prisma.report.deleteMany({ where: { reporterId: { in: dummyUserIds } } })
    await prisma.report.deleteMany({ where: { reportedId: { in: dummyUserIds } } })
    await prisma.review.deleteMany({ where: { reviewerId: { in: dummyUserIds } } })
    await prisma.review.deleteMany({ where: { revieweeId: { in: dummyUserIds } } })
    await prisma.participant.deleteMany({ where: { userId: { in: dummyUserIds } } })
    await prisma.userBadge.deleteMany({ where: { userId: { in: dummyUserIds } } })

    // 더미 유저가 호스팅한 모임 관련 데이터 삭제
    const dummyMeetings = await prisma.meeting.findMany({
      where: { hostId: { in: dummyUserIds } },
      select: { id: true },
    })
    const dummyMeetingIds = dummyMeetings.map(m => m.id)

    if (dummyMeetingIds.length > 0) {
      await prisma.meetingComment.deleteMany({ where: { meetingId: { in: dummyMeetingIds } } })
      await prisma.gameRole.deleteMany({ where: { meetingId: { in: dummyMeetingIds } } })
      await prisma.report.deleteMany({ where: { meetingId: { in: dummyMeetingIds } } })
      await prisma.review.deleteMany({ where: { meetingId: { in: dummyMeetingIds } } })
      await prisma.participant.deleteMany({ where: { meetingId: { in: dummyMeetingIds } } })
      await prisma.meeting.deleteMany({ where: { hostId: { in: dummyUserIds } } })
    }

    // 사용자 삭제
    const result = await prisma.user.deleteMany({ where: { isDummy: true } })

    return NextResponse.json({
      message: `더미 사용자 ${result.count}명 및 관련 데이터가 삭제되었습니다`,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Failed to delete dummy users:', error)
    return NextResponse.json(
      { message: '더미 사용자 삭제에 실패했습니다' },
      { status: 500 }
    )
  }
}
