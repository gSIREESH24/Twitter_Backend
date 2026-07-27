export const hashtagSelect = {
  id: true,
  name: true,
  createdAt: true,
} as const;

export const hashtagTweetSelect = {
  id: true,
  content: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      username: true,
      profileImage: true,
    },
  },
} as const;
