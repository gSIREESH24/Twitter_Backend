# 07 - Apache Kafka Event Streaming

This document details the transition from Redis Pub/Sub to a robust, scalable event-driven architecture powered by **Apache Kafka**.

---

## 1. Why We Migrated to Kafka

While Redis Pub/Sub is incredibly fast, it lacks **Message Persistence**. In Redis, if a publisher broadcasts a `tweet-liked` event while the Notification Service subscriber is offline, that message is lost forever.

**Kafka** completely resolves this limitation and introduces several enterprise-grade capabilities:
- **Disk Persistence:** Kafka writes events to disk. If a consumer crashes, it simply resumes reading from its last recorded "offset" when it restarts, ensuring zero data loss.
- **Consumer Groups:** Kafka gracefully divides work across multiple backend instances. If you scale to 5 Node.js servers, they all share a Consumer Group. Kafka will route the event to only *one* of the instances, preventing 5 duplicate emails from being sent!
- **Partitions:** High-volume topics are split into parallel partitions, allowing horizontal read/write scalability that outpaces traditional message queues.

---

## 2. Kafka Implementation Architecture

We implemented a generic `EventBus` interface early in the project. Because our services were tightly coupled to the *interface* rather than a specific technology, transitioning required zero business-logic rewrites.

### Infrastructure
- **Broker:** A local Apache Kafka server installed via Homebrew.
- **Client:** The official `kafkajs` Node.js client library.

### `KafkaEventBus` Design
- Located at `src/common/events/kafka-event-bus.ts`.
- **Producer:** The `publish()` method maps a topic string and JSON payload directly to the Kafka `producer.send()` API.
- **Consumer:** The `subscribe()` method accepts handlers and maps them to topics. Because `kafkajs` utilizes a single, unified `consumer.run()` loop per client, the `KafkaEventBus` aggregates all handlers internally and invokes them dynamically when events stream in.

### Consumer Group Configuration
- `groupId: "twitter-monolith-group"`
- Because the entire backend runs as a single monolith for now, all subscriptions share this group. If we later break the backend into separate microservices (e.g., Notification Repo vs Analytics Repo), we would assign distinct Group IDs (`notification-group`, `analytics-group`) so that *both* microservices receive their own independent copy of every event.

---

## 3. Implemented Event Topics

Our business logic publishes the following events dynamically:

| Publishing Service | Topic Name | Payload | Subscribers / Consumers |
| :--- | :--- | :--- | :--- |
| **LikeService** | `tweet-liked` | `{ actorId, tweetId, recipientId }` | Notification (creates), Analytics, Achievements, Email |
| **LikeService** | `tweet-unliked` | `{ actorId, tweetId }` | Notification (deletes) |
| **FollowService** | `user-followed` | `{ followerId, followingId }` | Notification (creates) |
| **FollowService** | `user-unfollowed` | `{ followerId, followingId }` | Notification (deletes) |
| **TweetService** | `tweet-created` | `{ authorId, tweetId }` | Fan-out caching, Analytics |
| **TweetService** | `tweet-deleted` | `{ authorId, tweetId }` | Cache cleanup |

## 4. Demonstrating Loose Coupling
If tomorrow the business decides to introduce an **Achievements System** (e.g., unlocking a "Popular" badge at 1,000 likes), we no longer have to touch `LikeService`. 

We simply add a new subscriber to `src/subscribers/index.ts`:

```typescript
await eventBus.subscribe("tweet-liked", async (message) => {
    // Check achievements DB and unlock badges
});
```

The `LikeService` stays perfectly clean, isolated, and scalable.
