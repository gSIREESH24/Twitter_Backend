export const commentSelect = {
  id: true,

  content: true,

  createdAt: true,

  updatedAt: true,

  user: {
    select: {
      id: true,
      username: true,
      profileImage: true,
    },
  },
} as const;