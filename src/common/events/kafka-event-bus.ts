import { Kafka, Producer, Consumer, logLevel } from "kafkajs";
import { EventBus } from "./event-bus";
import logger from "../logger/logger";

export class KafkaEventBus implements EventBus {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private isConnected = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: "twitter-backend",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
      logLevel: logLevel.ERROR,
    });

    this.producer = this.kafka.producer();
    
    // For a monolithic application, we can use a single consumer group.
    // In a microservices architecture, each service (e.g. notification-service)
    // would have its own consumer group to receive its own copy of the events.
    this.consumer = this.kafka.consumer({ groupId: "twitter-monolith-group" });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      this.isConnected = true;
      logger.info("✅ Kafka EventBus Connected (Producer & Consumer)");
    } catch (error) {
      logger.error(error, "❌ Kafka Connection Error");
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.isConnected = false;
      logger.info("Kafka EventBus Disconnected");
    }
  }

  async publish(topic: string, message: any): Promise<void> {
    if (!this.isConnected) {
      logger.warn(`Cannot publish to ${topic}: Kafka not connected`);
      return;
    }

    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    } catch (error) {
      logger.error(error, `Error publishing to topic ${topic}`);
    }
  }

  async subscribe(topic: string, handler: (message: any) => Promise<void> | void): Promise<void> {
    try {
      // Subscribe to the topic from the beginning
      await this.consumer.subscribe({ topic, fromBeginning: true });

      // In kafkajs, each consumer group only has one run loop.
      // So calling run() multiple times throws an error.
      // A robust implementation would store handlers in a Map<string, handler[]>
      // and call consumer.run() once.
      // For this simplified version, we handle this by checking if the consumer is already running,
      // or we just map handlers and start the consumer loop once.
      // Let's implement the handler mapping approach.
      this.addHandler(topic, handler);
      await this.startConsumerLoop();
    } catch (error) {
      logger.error(error, `Error subscribing to topic ${topic}`);
    }
  }

  // Handle multiple topic subscriptions within a single kafkajs run loop
  private handlers = new Map<string, ((message: any) => Promise<void> | void)[]>();
  private isConsuming = false;

  private addHandler(topic: string, handler: (message: any) => Promise<void> | void) {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, []);
    }
    this.handlers.get(topic)!.push(handler);
  }

  private async startConsumerLoop() {
    if (this.isConsuming) return; // Prevent multiple runs
    this.isConsuming = true;

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) return;
          const parsedMessage = JSON.parse(message.value.toString());
          const topicHandlers = this.handlers.get(topic) || [];
          
          for (const handler of topicHandlers) {
            await handler(parsedMessage);
          }
        } catch (error) {
          logger.error(error, `Error processing message from topic ${topic}`);
        }
      },
    });
  }
}
