import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 관리자 이메일 목록 (환경변수로 관리하는 것이 좋음)
const ADMIN_EMAILS = ['admin@gyeongdo.com', process.env.ADMIN_EMAIL].filter(Boolean)

// 관리자 확인 함수
const isAdmin = (email?: string | null) => {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}

// GET /api/admin/reports - 신고 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const reports = await prisma.report.findMany({
      where: status ? { status: status as 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED' } : undefined,
      include: {
        reporter: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
          },
        },
        reported: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            isBanned: true,
            _count: {
              select: {
                reportsReceived: true,
              },
            },
          },
        },
        meeting: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 각 신고 대상자의 서로 다른 모임에서 받은 신고 수 계산
    const reportsWithStats = await Promise.all(
      reports.map(async (report: typeof reports[number]) => {
        const uniqueMeetingReports = await prisma.report.groupBy({
          by: ['meetingId'],
          where: {
            reportedId: report.reportedId,
            meetingId: { not: null },
          },
        })

        return {
          ...report,
          uniqueMeetingReportCount: uniqueMeetingReports.length,
        }
      })
    )

    return NextResponse.json(reportsWithStats)
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return NextResponse.json(
      { message: '신고 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/reports - 신고 처리 및 계정 정지
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ message: '관리자 권한이 필요합니다' }, { status: 403 })
    }

    const body = await request.json()
    const { reportId, action, banReason } = body

    if (!reportId || !action) {
      return NextResponse.json({ message: '필수 항목이 누락되었습니다' }, { status: 400 })
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reported: true,
      },
    })

    if (!report) {
      return NextResponse.json({ message: '신고를 찾을 수 없습니다' }, { status: 404 })
    }

    // 신고 처리
    if (action === 'dismiss') {
      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'DISMISSED',
          processedAt: new Date(),
        },
      })
      return NextResponse.json({ message: '신고가 기각되었습니다' })
    }

    if (action === 'resolve') {
      await prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'RESOLVED',
          processedAt: new Date(),
        },
      })
      return NextResponse.json({ message: '신고가 처리되었습니다' })
    }

    // 일시 정지
    if (action === 'ban') {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: report.reportedId },
          data: {
            isBanned: true,
            bannedAt: new Date(),
            banReason: banReason || '신고 누적으로 인한 계정 정지',
          },
        }),
        prisma.report.update({
          where: { id: reportId },
          data: {
            status: 'RESOLVED',
            processedAt: new Date(),
          },
        }),
      ])
      return NextResponse.json({ message: '계정이 정지되었습니다' })
    }

    // 영구 정지 (BannedKakao에 추가)
    if (action === 'permanentBan') {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: report.reportedId },
          data: {
            isBanned: true,
            bannedAt: new Date(),
            banReason: banReason || '영구 정지',
          },
        }),
        prisma.bannedKakao.create({
          data: {
            kakaoId: report.reported.kakaoId,
            reason: banReason || '영구 정지',
            originalUserId: report.reportedId,
            originalNickname: report.reported.nickname,
          },
        }),
        prisma.report.update({
          where: { id: reportId },
          data: {
            status: 'RESOLVED',
            processedAt: new Date(),
          },
        }),
      ])
      return NextResponse.json({ message: '계정이 영구 정지되었습니다' })
    }

    return NextResponse.json({ message: '알 수 없는 작업입니다' }, { status: 400 })
  } catch (error) {
    console.error('Failed to process report:', error)
    return NextResponse.json(
      { message: '신고 처리에 실패했습니다' },
      { status: 500 }
    )
  }
}
