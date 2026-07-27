export const retweetUserSelect = {
  user: {
    select: {
      id: true,
      username: true,
      profileImage: true,
    },
  },
} as const;
