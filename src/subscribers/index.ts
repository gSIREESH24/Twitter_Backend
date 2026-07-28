import { eventBus } from '../common/events';
import logger from '../common/logger/logger';
import { prisma } from '../config/database';

export async function setupSubscribers() {
    await eventBus.subscribe("tweet-liked", async (message) => {
        logger.info(`🔔 [Notification Service] Processing tweet-liked event...`);
        if (message.recipientId && message.actorId && message.tweetId) {
            await prisma.notification.create({
                data: {
                    type: "LIKE",
                    actorId: message.actorId,
                    recipientId: message.recipientId,
                    tweetId: message.tweetId,
                }
            });
        }
    });
    
    // Multiple Independent Consumers demonstrating Kafka!
    await eventBus.subscribe("tweet-liked", async (message) => {
        logger.info(`📊 [Analytics Service] Incrementing like counters for analytics...`);
    });

    await eventBus.subscribe("tweet-liked", async (message) => {
        logger.info(`🏆 [Achievements Service] Checking if user unlocked "Popular" badge...`);
    });

    await eventBus.subscribe("tweet-liked", async (message) => {
        logger.info(`📧 [Email Service] Queuing email notification for recipient...`);
    });

    await eventBus.subscribe("tweet-unliked", async (message) => {
        logger.info(`🔔 [Notification Service] Scrubbing unliked notification...`);
        if (message.actorId && message.tweetId) {
            await prisma.notification.deleteMany({
                where: {
                    type: "LIKE",
                    actorId: message.actorId,
                    tweetId: message.tweetId,
                }
            });
        }
    });

    await eventBus.subscribe("user-followed", async (message) => {
        logger.info(`🔔 Subscriber Notification [user-followed]: ${JSON.stringify(message)}`);
        if (message.followerId && message.followingId) {
            await prisma.notification.create({
                data: {
                    type: "FOLLOW",
                    actorId: message.followerId,
                    recipientId: message.followingId,
                }
            });
        }
    });

    await eventBus.subscribe("user-unfollowed", async (message) => {
        logger.info(`🔔 Subscriber Notification [user-unfollowed]: ${JSON.stringify(message)}`);
        if (message.followerId && message.followingId) {
            // Best effort delete
            await prisma.notification.deleteMany({
                where: {
                    type: "FOLLOW",
                    actorId: message.followerId,
                    recipientId: message.followingId,
                }
            });
        }
    });

    await eventBus.subscribe("tweet-created", async (message) => {
        logger.info(`🔔 Subscriber Notification [tweet-created]: ${JSON.stringify(message)}`);
        // Here you would implement Fan-out on Write if desired
    });

    await eventBus.subscribe("tweet-deleted", async (message) => {
        logger.info(`🔔 Subscriber Notification [tweet-deleted]: ${JSON.stringify(message)}`);
        // Cleanup logic if desired
    });

    logger.info("✅ All Pub/Sub subscribers have been registered successfully.");
}

