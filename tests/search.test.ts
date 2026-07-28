import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config';
import { SearchService } from '../src/modules/search/search.service';

jest.mock('../src/modules/search/search.service');

describe('Search Endpoints', () => {
  const token = jwt.sign({ userId: 'user-1' }, env.JWT_SECRET, { expiresIn: '1h' });

  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/v1/search/users', () => {
    it('should return users matching query', async () => {
      (SearchService.prototype.searchUsers as jest.Mock).mockResolvedValue([{ id: 'user-2' }]);

      const res = await request(app)
        .get('/api/v1/search/users?q=john')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });
});
