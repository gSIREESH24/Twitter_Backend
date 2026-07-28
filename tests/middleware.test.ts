import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../src/common/middleware/auth.middleware';
import jwt from 'jsonwebtoken';
import { env } from '../src/config';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = { query: {} };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should call next if valid token is provided', () => {
    const token = jwt.sign({ userId: 'user-1' }, env.JWT_SECRET, { expiresIn: '1h' });
    mockRequest.headers = { authorization: `Bearer ${token}` };

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect((mockRequest as any).user.userId).toBe('user-1');
  });

  it('should return 401 if no authorization header is provided', () => {
    mockRequest.headers = {};

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not authenticated' })
    );
  });

  it('should return 401 if invalid token is provided', () => {
    mockRequest.headers = { authorization: 'Bearer invalid-token' };

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid token' })
    );
  });
});
