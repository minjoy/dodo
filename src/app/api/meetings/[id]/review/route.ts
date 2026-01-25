import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkAndAwardBadges } from '@/lib/badges'

// POST /api/meetings/[id]/review - 평가하기
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
    const body = await request.json()
    const { revieweeId, rating, comment, isLike } = body

    // 유효성 검사
    if (!revieweeId || !rating) {
      return NextResponse.json({ message: '평가 대상과 별점은 필수입니다' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: '별점은 1~5 사이여야 합니다' }, { status: 400 })
    }

    // 자기 자신 평가 불가
    if (revieweeId === session.user.id) {
      return NextResponse.json({ message: '자기 자신을 평가할 수 없습니다' }, { status: 400 })
    }

    // 모임 조회
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        participants: {
          where: { status: { not: 'CANCELLED' } },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json({ message: '모임을 찾을 수 없습니다' }, { status: 404 })
    }

    // 완료된 모임만 평가 가능
    if (meeting.status !== 'COMPLETED') {
      return NextResponse.json({ message: '완료된 모임만 평가할 수 있습니다' }, { status: 400 })
    }

    // 평가자가 모임 참여자인지 확인 (호스트 포함)
    const isReviewerHost = meeting.hostId === session.user.id
    const isReviewerParticipant = meeting.participants.some((p: { userId: string }) => p.userId === session.user.id)

    if (!isReviewerHost && !isReviewerParticipant) {
      return NextResponse.json({ message: '모임 참여자만 평가할 수 있습니다' }, { status: 403 })
    }

    // 평가 대상이 모임 참여자인지 확인 (호스트 포함)
    const isRevieweeHost = meeting.hostId === revieweeId
    const isRevieweeParticipant = meeting.participants.some((p: { userId: string }) => p.userId === revieweeId)

    if (!isRevieweeHost && !isRevieweeParticipant) {
      return NextResponse.json({ message: '모임 참여자만 평가할 수 있습니다' }, { status: 400 })
    }

    // 이미 평가했는지 확인
    const existingReview = await prisma.review.findUnique({
      where: {
        meetingId_reviewerId_revieweeId: {
          meetingId,
          reviewerId: session.user.id,
          revieweeId,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json({ message: '이미 평가한 참여자입니다' }, { status: 400 })
    }

    // 평가 생성 및 좋아요 카운트 증가 (트랜잭션)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      // 평가 생성
      await tx.review.create({
        data: {
          meetingId,
          reviewerId: session.user.id,
          revieweeId,
          rating,
          comment: comment || null,
          isLike: isLike || false,
        },
      })

      // 좋아요인 경우 likeReceived 증가
      if (isLike) {
        await tx.user.update({
          where: { id: revieweeId },
          data: {
            likeReceived: { increment: 1 },
            exp: { increment: 5 }, // 좋아요 받으면 경험치 추가
          },
        })
      }
    })

    // 뱃지 체크
    checkAndAwardBadges(revieweeId).catch(
      (error) => console.error('Failed to check badges:', error)
    )

    return NextResponse.json({ success: true, message: '평가가 완료되었습니다' })
  } catch (error) {
    console.error('Failed to submit review:', error)
    return NextResponse.json(
      { message: '평가에 실패했습니다' },
      { status: 500 }
    )
  }
}

// GET /api/meetings/[id]/review - 내가 받은 평가 조회 (본인만)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const { id: meetingId } = await params
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')

    // 본인의 평가만 조회 가능
    if (targetUserId && targetUserId !== session.user.id) {
      return NextResponse.json({ message: '본인의 평가만 조회할 수 있습니다' }, { status: 403 })
    }

    // 내가 받은 평가 조회
    const reviews = await prisma.review.findMany({
      where: {
        meetingId,
        revieweeId: session.user.id,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        isLike: true,
        createdAt: true,
        // reviewer 정보는 익명 처리 (누가 평가했는지 알 수 없게)
      },
    })

    // 내가 한 평가 목록 (누구에게 평가했는지 확인용)
    const myReviews = await prisma.review.findMany({
      where: {
        meetingId,
        reviewerId: session.user.id,
      },
      select: {
        revieweeId: true,
      },
    })

    return NextResponse.json({
      receivedReviews: reviews,
      reviewedUserIds: myReviews.map((r: { revieweeId: string }) => r.revieweeId),
    })
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
    return NextResponse.json(
      { message: '평가 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
