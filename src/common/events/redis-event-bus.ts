import { createClient } from "redis";
import redisClient from "../../config/redis";
import { EventBus } from "./event-bus";
import logger from "../logger/logger";

export class RedisEventBus implements EventBus {
  private subscriber: ReturnType<typeof createClient>;

  constructor() {
    this.subscriber = createClient({
      url: process.env.REDIS_URL,
    });

    this.subscriber.on("error", (err) => {
      logger.error("❌ Redis Subscriber Error:", err);
    });
  }

  async connect(): Promise<void> {
    await this.subscriber.connect();
    logger.info("✅ Redis EventBus Subscriber Connected");
  }

  async disconnect(): Promise<void> {
    await this.subscriber.disconnect();
  }

  async publish(topic: string, message: any): Promise<void> {
    try {
      await redisClient.publish(topic, JSON.stringify(message));
    } catch (error) {
      logger.error(error, `Error publishing to topic ${topic}`);
    }
  }

  async subscribe(topic: string, handler: (message: any) => Promise<void> | void): Promise<void> {
    await this.subscriber.subscribe(topic, async (messageStr) => {
      try {
        const message = JSON.parse(messageStr);
        await handler(message);
      } catch (error) {
        logger.error(error, `Error handling message from topic ${topic}`);
      }
    });
  }
}
