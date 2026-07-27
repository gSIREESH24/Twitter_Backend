export const feedSelect = {
  id: true,

  content: true,

  createdAt: true,

  updatedAt: true,

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

  likes: {
    select: {
      userId: true,
    },
  },

} as const;