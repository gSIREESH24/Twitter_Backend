import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config';
import { FeedService } from '../src/modules/feed/feed.service';

jest.mock('../src/modules/feed/feed.service');

const getMockToken = () => {
  return jwt.sign({ userId: 'user-1' }, env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Feed Endpoints', () => {
  const token = getMockToken();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/feed', () => {
    it('should return feed tweets', async () => {
      (FeedService.prototype.getFeed as jest.Mock).mockResolvedValue([
        { id: 'tweet-1', content: 'hello' },
        { id: 'tweet-2', content: 'world' }
      ]);

      const res = await request(app)
        .get('/api/v1/feed')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });
});
