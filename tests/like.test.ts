import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config';
import { LikeService } from '../src/modules/like/like.service';

jest.mock('../src/modules/like/like.service');

const getMockToken = () => {
  return jwt.sign({ userId: 'user-1' }, env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Like Endpoints', () => {
  const token = getMockToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/tweets/:tweetId/like', () => {
    it('should like a tweet', async () => {
      // Mock the prototype method
      (LikeService.prototype.likeTweet as jest.Mock).mockResolvedValue({ userId: 'user-1', tweetId: 'tweet-1' });

      const res = await request(app)
        .post('/api/v1/tweets/tweet-1/like')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(201); // Controller returns 201
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/tweets/:tweetId/like', () => {
    it('should unlike a tweet', async () => {
      (LikeService.prototype.unlikeTweet as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/v1/tweets/tweet-1/like')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });
});
