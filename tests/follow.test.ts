import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config';
import { FollowService } from '../src/modules/follow/follow.service';

jest.mock('../src/modules/follow/follow.service');

describe('Follow Endpoints', () => {
  const token = jwt.sign({ userId: 'user-1' }, env.JWT_SECRET, { expiresIn: '1h' });

  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/v1/users/:id/follow', () => {
    it('should follow a user', async () => {
      (FollowService.prototype.followUser as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .post('/api/v1/users/user-2/follow')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
    });
  });
});
