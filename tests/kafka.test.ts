import { KafkaEventBus } from '../src/common/events/kafka-event-bus';

// We need to unmock the kafka event bus to test the class implementation
jest.unmock('../src/common/events/kafka-event-bus');

// Mock kafkajs
jest.mock('kafkajs', () => {
  return {
    Kafka: jest.fn().mockImplementation(() => ({
      producer: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(true),
        disconnect: jest.fn().mockResolvedValue(true),
        send: jest.fn().mockResolvedValue(true),
      }),
      consumer: jest.fn().mockReturnValue({
        connect: jest.fn().mockResolvedValue(true),
        disconnect: jest.fn().mockResolvedValue(true),
        subscribe: jest.fn().mockResolvedValue(true),
        run: jest.fn().mockResolvedValue(true),
      })
    }))
  };
});

describe('KafkaEventBus', () => {
  let eventBus: KafkaEventBus;

  beforeEach(() => {
    eventBus = new KafkaEventBus();
  });

  it('should connect producer and consumer successfully', async () => {
    await expect(eventBus.connect()).resolves.toBeUndefined();
  });

  it('should publish events to topics', async () => {
    await eventBus.connect();
    await expect(eventBus.publish('test-topic', { id: 1 })).resolves.toBeUndefined();
  });

  it('should register subscribers', async () => {
    const mockHandler = jest.fn();
    await eventBus.connect();
    await expect(eventBus.subscribe('test-topic', mockHandler)).resolves.toBeUndefined();
  });
});
