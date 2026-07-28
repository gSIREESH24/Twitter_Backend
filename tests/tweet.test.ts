import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config';
import { TweetService } from '../src/modules/tweet/tweet.service';

jest.mock('../src/modules/tweet/tweet.service');

describe('Tweet Endpoints', () => {
  const token = jwt.sign({ userId: 'user-1' }, env.JWT_SECRET, { expiresIn: '1h' });

  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/v1/tweets', () => {
    it('should create a tweet successfully', async () => {
      (TweetService.prototype.createTweet as jest.Mock).mockResolvedValue({ id: 'tweet-1', content: 'Hello world' });

      const res = await request(app)
        .post('/api/v1/tweets')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Hello world' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
    });
  });
});
