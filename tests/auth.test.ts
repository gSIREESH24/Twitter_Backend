import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database';
import bcrypt from 'bcrypt';

const prismaMock = prisma as any;

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock the Prisma client responses
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword',
        name: 'Test User',
      });

      const res = await request(app).post('/api/v1/users/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        name: 'Test User',
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should fail if email is already taken', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      const res = await request(app).post('/api/v1/users/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        name: 'Test User',
      });

      expect(res.statusCode).toEqual(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Email already exists/);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', 10),
      });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });
  });
});
