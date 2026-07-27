import { SearchRepository } from "./search.repository";

export class SearchService {

  constructor(
    private readonly searchRepository =
      new SearchRepository()
  ) {}

  async searchUsers(query: string) {
    return this.searchRepository.searchUsers(
      query.trim()
    );
  }

async searchTweets(
  query: string,
  currentUserId: string,
  cursor: string | undefined,
  limit: number
) {

  const tweets =
    await this.searchRepository.searchTweets(
      query.trim(),
      currentUserId,
      cursor,
      limit
    );

  return {
    tweets: tweets.map((tweet) => ({
      id: tweet.id,
      content: tweet.content,
      createdAt: tweet.createdAt,
      author: tweet.author,

      likeCount: tweet._count.likes,

      commentCount: tweet._count.comments,

      isLiked: tweet.likes.length > 0,
    })),

    nextCursor:
      tweets.length === limit
        ? tweets[tweets.length - 1].id
        : null,
  };
}



}