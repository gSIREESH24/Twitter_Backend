import { RedisEventBus } from '../src/common/events/redis-event-bus';

describe('RedisEventBus', () => {
  let eventBus: RedisEventBus;

  beforeEach(() => {
    eventBus = new RedisEventBus();
  });

  it('should publish events via redis client', async () => {
    // The Redis client is already mocked in setup.ts
    await expect(eventBus.publish('test-topic', { key: 'value' })).resolves.toBeUndefined();
  });

  it('should subscribe to channels', async () => {
    const handler = jest.fn();
    await expect(eventBus.subscribe('test-topic', handler)).resolves.toBeUndefined();
  });
});
