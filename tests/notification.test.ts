import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config';
import { NotificationService } from '../src/modules/notification/notification.service';

jest.mock('../src/modules/notification/notification.service');

describe('Notification Endpoints', () => {
  const token = jwt.sign({ userId: 'user-1' }, env.JWT_SECRET, { expiresIn: '1h' });

  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/v1/notifications', () => {
    it('should return user notifications', async () => {
      (NotificationService.prototype.getNotifications as jest.Mock).mockResolvedValue([{ id: 'notif-1' }]);

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });
});
