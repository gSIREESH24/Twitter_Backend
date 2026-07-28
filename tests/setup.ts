import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// 1. Mock Prisma
// We mock the database client so tests run instantly without a real database.
jest.mock('../src/config/database', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

// 2. Mock Redis Package
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    on: jest.fn(),
    subscribe: jest.fn().mockResolvedValue(true),
    publish: jest.fn().mockResolvedValue(true),
  }),
}));

// Mock Redis Config Client
jest.mock('../src/config/redis', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    eval: jest.fn().mockResolvedValue(1),
    zRange: jest.fn(),
    zIncrBy: jest.fn(),
    connect: jest.fn(),
    on: jest.fn(),
    publish: jest.fn().mockResolvedValue(true),
  },
}));

// 3. Mock Kafka EventBus
jest.mock('../src/common/events/kafka-event-bus', () => ({
  KafkaEventBus: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn(),
  })),
}));

// Clear mocks before each test
beforeEach(() => {
  mockReset(require('../src/config/database').prisma);
  jest.clearAllMocks();
});
