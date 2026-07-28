import app from './app';
import logger from './common/logger/logger';
import { env } from './config';
import { prisma } from './config/database';
import redisClient from "./config/redis";
import { eventBus } from './common/events';
import { setupSubscribers } from './subscribers';

async function startServer() {
    await prisma.$connect();

    await redisClient.connect();
    await eventBus.connect();

    // Setup Event Subscribers
    await setupSubscribers();

    app.listen(env.PORT, () => {
      logger.info(`🚀 Server started on port ${env.PORT}`);
    });
}

startServer();

process.on("SIGINT", async () => {
    await prisma.$disconnect();
    await eventBus.disconnect();
    await redisClient.disconnect();

    process.exit(0);
});