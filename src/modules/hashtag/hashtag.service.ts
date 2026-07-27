import { AppError } from "../../common/errors/app-error";
import { HashtagRepository } from "./hashtag.repository";

export class HashtagService {
  constructor(
    private readonly hashtagRepository = new HashtagRepository()
  ) {}

  async getTweetsByHashtag(name: string, page: number, limit: number) {
    const cleanName = name.startsWith("#") ? name.substring(1) : name;

    const hashtag = await this.hashtagRepository.findByName(cleanName);

    if (!hashtag) {
      return [];
    }

    return this.hashtagRepository.getTweetsByHashtag(cleanName, page, limit);
  }

  async getTrendingHashtags(limit: number = 10) {
    return this.hashtagRepository.getTrendingHashtags(limit);
  }

  async getAllHashtags(query?: string, limit: number = 20) {
    const cleanQuery =
      query && query.startsWith("#") ? query.substring(1) : query;
    return this.hashtagRepository.getAllHashtags(cleanQuery, limit);
  }
}
