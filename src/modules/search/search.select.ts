export const userSearchSelect = {
  id: true,
  username: true,
  profileImage: true,
  bio: true,
} as const;

export const tweetSearchSelect = {
  id: true,
  content: true,
  createdAt: true,

  author: {
    select: {
      id: true,
      username: true,
      profileImage: true,
    },
  },

  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
} as const;