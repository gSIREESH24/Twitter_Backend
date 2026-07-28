import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config';
import { CommentService } from '../src/modules/comment/comment.service';

jest.mock('../src/modules/comment/comment.service');

describe('Comment Endpoints', () => {
  const token = jwt.sign({ userId: 'user-1' }, env.JWT_SECRET, { expiresIn: '1h' });

  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/v1/tweets/:tweetId/comments', () => {
    it('should add a comment to a tweet', async () => {
      (CommentService.prototype.createComment as jest.Mock).mockResolvedValue({ id: 'comment-1', content: 'Nice tweet!' });

      const res = await request(app)
        .post('/api/v1/tweets/tweet-1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Nice tweet!' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
    });
  });
});
