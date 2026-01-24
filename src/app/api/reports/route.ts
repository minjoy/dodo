import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/reports - 사용자 신고
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { reportedId, reason, description, meetingId } = body

    if (!reportedId || !reason) {
      return NextResponse.json(
        { message: '신고 대상과 사유를 입력해주세요' },
        { status: 400 }
      )
    }

    // 자기 자신 신고 방지
    if (reportedId === session.user.id) {
      return NextResponse.json(
        { message: '자기 자신을 신고할 수 없습니다' },
        { status: 400 }
      )
    }

    // 신고 대상 존재 확인
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedId },
    })

    if (!reportedUser) {
      return NextResponse.json(
        { message: '신고 대상을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 동일 사용자에 대한 중복 신고 방지 (24시간 내)
    const recentReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        reportedId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    })

    if (recentReport) {
      return NextResponse.json(
        { message: '이미 해당 사용자를 신고했습니다. 24시간 후에 다시 시도해주세요.' },
        { status: 400 }
      )
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reportedId,
        reason,
        description,
        meetingId,
      },
    })

    return NextResponse.json({
      message: '신고가 접수되었습니다',
      reportId: report.id,
    })
  } catch (error) {
    console.error('Failed to create report:', error)
    return NextResponse.json(
      { message: '신고 접수에 실패했습니다' },
      { status: 500 }
    )
  }
}
