import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== 더미 사용자 데이터 삭제 시작 ===\n')

  // 1. 더미 유저 조회
  const dummyUsers = await prisma.user.findMany({
    where: { isDummy: true },
    select: { id: true, nickname: true },
  })

  if (dummyUsers.length === 0) {
    console.log('삭제할 더미 사용자가 없습니다.')
    return
  }

  console.log(`더미 사용자 ${dummyUsers.length}명을 삭제합니다...\n`)

  const dummyUserIds = dummyUsers.map(u => u.id)

  // 2. 관련 데이터 삭제 (FK 순서 중요: 자식 → 부모)

  // 2-1. 푸시 구독 삭제
  const deletedPushSubs = await prisma.pushSubscription.deleteMany({
    where: { userId: { in: dummyUserIds } },
  })
  console.log(`  푸시 구독 삭제: ${deletedPushSubs.count}건`)

  // 2-2. 떠들기 삭제
  const deletedShouts = await prisma.shout.deleteMany({
    where: { userId: { in: dummyUserIds } },
  })
  console.log(`  떠들기 삭제: ${deletedShouts.count}건`)

  // 2-3. 모임 댓글 삭제
  const deletedComments = await prisma.meetingComment.deleteMany({
    where: { userId: { in: dummyUserIds } },
  })
  console.log(`  모임 댓글 삭제: ${deletedComments.count}건`)

  // 2-4. 게임 역할 삭제
  const deletedGameRoles = await prisma.gameRole.deleteMany({
    where: { userId: { in: dummyUserIds } },
  })
  console.log(`  게임 역할 삭제: ${deletedGameRoles.count}건`)

  // 2-5. 신고 삭제 (작성한 신고 + 받은 신고)
  const deletedReportsGiven = await prisma.report.deleteMany({
    where: { reporterId: { in: dummyUserIds } },
  })
  const deletedReportsReceived = await prisma.report.deleteMany({
    where: { reportedId: { in: dummyUserIds } },
  })
  console.log(`  신고 삭제: ${deletedReportsGiven.count + deletedReportsReceived.count}건`)

  // 2-6. 리뷰 삭제 (작성한 리뷰 + 받은 리뷰)
  const deletedReviewsGiven = await prisma.review.deleteMany({
    where: { reviewerId: { in: dummyUserIds } },
  })
  const deletedReviewsReceived = await prisma.review.deleteMany({
    where: { revieweeId: { in: dummyUserIds } },
  })
  console.log(`  리뷰 삭제: ${deletedReviewsGiven.count + deletedReviewsReceived.count}건`)

  // 2-7. 참가 기록 삭제
  const deletedParticipants = await prisma.participant.deleteMany({
    where: { userId: { in: dummyUserIds } },
  })
  console.log(`  참가 기록 삭제: ${deletedParticipants.count}건`)

  // 2-8. 뱃지 획득 기록 삭제
  const deletedUserBadges = await prisma.userBadge.deleteMany({
    where: { userId: { in: dummyUserIds } },
  })
  console.log(`  뱃지 기록 삭제: ${deletedUserBadges.count}건`)

  // 2-9. 더미 유저가 호스팅한 모임의 관련 데이터 삭제
  const dummyMeetings = await prisma.meeting.findMany({
    where: { hostId: { in: dummyUserIds } },
    select: { id: true },
  })
  const dummyMeetingIds = dummyMeetings.map(m => m.id)

  if (dummyMeetingIds.length > 0) {
    // 모임에 달린 댓글, 참가자, 리뷰, 역할, 신고 삭제
    await prisma.meetingComment.deleteMany({ where: { meetingId: { in: dummyMeetingIds } } })
    await prisma.gameRole.deleteMany({ where: { meetingId: { in: dummyMeetingIds } } })
    await prisma.report.deleteMany({ where: { meetingId: { in: dummyMeetingIds } } })
    await prisma.review.deleteMany({ where: { meetingId: { in: dummyMeetingIds } } })
    await prisma.participant.deleteMany({ where: { meetingId: { in: dummyMeetingIds } } })

    // 모임 삭제
    const deletedMeetings = await prisma.meeting.deleteMany({
      where: { hostId: { in: dummyUserIds } },
    })
    console.log(`  호스팅 모임 삭제: ${deletedMeetings.count}건`)
  }

  // 3. 사용자 삭제
  const deletedUsers = await prisma.user.deleteMany({
    where: { isDummy: true },
  })

  console.log(`\n=== 완료: 더미 사용자 ${deletedUsers.count}명 및 관련 데이터 모두 삭제됨 ===`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
