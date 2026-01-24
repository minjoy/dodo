import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateLevel } from '@/lib/utils'

// POST /api/reviews - 리뷰 작성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 })
    }

    const body = await request.json()
    const { meetingId, revieweeId, rating, comment, isLike } = body

    // 유효성 검사
    if (!meetingId || !revieweeId) {
      return NextResponse.json(
        { message: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: '평점은 1~5 사이여야 합니다' },
        { status: 400 }
      )
    }

    // 자기 자신 평가 불가
    if (session.user.id === revieweeId) {
      return NextResponse.json(
        { message: '자기 자신을 평가할 수 없습니다' },
        { status: 400 }
      )
    }

    // 모임 완료 확인
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    })

    if (!meeting || meeting.status !== 'COMPLETED') {
      return NextResponse.json(
        { message: '완료된 모임만 평가할 수 있습니다' },
        { status: 400 }
      )
    }

    // 중복 리뷰 확인
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
      return NextResponse.json(
        { message: '이미 평가한 멤버입니다' },
        { status: 400 }
      )
    }

    // 리뷰 생성
    const review = await prisma.review.create({
      data: {
        meetingId,
        reviewerId: session.user.id,
        revieweeId,
        rating,
        comment,
        isLike: isLike || false,
      },
    })

    // 좋아요 받은 경우 경험치 증가
    if (isLike) {
      const reviewee = await prisma.user.update({
        where: { id: revieweeId },
        data: {
          likeReceived: { increment: 1 },
          exp: { increment: 5 },
        },
      })

      // 레벨 업 확인
      const newLevel = calculateLevel(reviewee.exp)
      if (newLevel > reviewee.level) {
        await prisma.user.update({
          where: { id: revieweeId },
          data: { level: newLevel },
        })
      }
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Failed to create review:', error)
    return NextResponse.json(
      { message: '리뷰 작성에 실패했습니다' },
      { status: 500 }
    )
  }
}
