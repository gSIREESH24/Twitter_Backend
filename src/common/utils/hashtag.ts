export const extractHashtags = (content: string): string[] => {
  const hashtags = content.match(/#[a-zA-Z0-9_]+/g) ?? [];
  const normalized = hashtags.map((tag) => tag.substring(1).toLowerCase());
  return Array.from(new Set(normalized));
};
