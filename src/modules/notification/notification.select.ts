export const notificationSelect = {
  id: true,
  type: true,
  recipientId: true,
  actorId: true,
  tweetId: true,
  isRead: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      username: true,
      profileImage: true,
    },
  },
  tweet: {
    select: {
      id: true,
      content: true,
    },
  },
} as const;
