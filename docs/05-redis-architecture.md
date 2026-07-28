# 05 - Redis Architecture & Scaling Patterns

This document outlines the various Redis caching and event-driven patterns implemented in the backend architecture to optimize performance, reduce database load, and decouple services.

---

## 1. Trending Hashtags (Sorted Sets)
**Problem:** Calculating the top trending hashtags via PostgreSQL requires an expensive `GROUP BY` and `ORDER BY COUNT DESC` query that scans millions of relations on every API hit.
**Solution:** 
- **Data Structure:** Redis Sorted Sets (`trending:hashtags`).
- **Write Path:** When a tweet is created, unique hashtags are extracted and incremented in Redis using `ZINCRBY` in `O(log(N))` time.
- **Read Path:** The Trending API bypasses PostgreSQL completely and fetches the top 10 hashtags directly from Redis using `ZRANGE` with `REV: true`.
- **Fault Tolerance:** If Redis crashes or restarts, the cache is automatically rebuilt via a lazy-loading "read-through" cache warming helper that groups the Postgres data and repopulates the Sorted Set.

---

## 2. Personalized Home Feed (Read-Through Cache & Fan-out on Read)
**Problem:** Constructing a personalized feed requires joining a user's followers with their tweets and sorting chronologically. Doing this directly on Postgres for every refresh is unscalable.
**Solution:**
- **Cache Strategy:** We cache the fully constructed JSON feed response per user (`feed:${userId}`) using a **Fan-out on Read** strategy. 
- **TTL (Time to Live):** The cached feed is given a 60-second TTL to ensure followers eventually see new tweets without requiring an expensive Fan-out on Write pipeline.
- **Cache Invalidation:** The user's *own* cache is aggressively invalidated (`DEL feed:${userId}`) when an event happens that alters their feed immediately:
  - Creating, updating, or deleting a tweet.
  - Following or unfollowing a user.
  - Liking or unliking a tweet.

---

## 3. Event-Driven Architecture (Redis Pub/Sub)
**Problem:** Services become tightly coupled when the core logic (e.g., Like Service) has to directly call other services (e.g., Notification Service, Analytics) leading to bloated, fragile code.
**Solution:**
- **Pattern:** Publish / Subscribe (Pub/Sub) event broadcasting.
- **Implementation:**
  - Designed an abstract `EventBus` interface.
  - Implemented `RedisEventBus` which utilizes a dedicated Redis subscriber client to actively listen for incoming events.
  - **Publishers:** Services simply broadcast events (e.g., `tweet-liked`, `user-followed`) and forget about it.
  - **Subscribers:** The `subscribers/index.ts` file maps these events to business logic, such as inserting real `Notification` records into the database.
- **Future Proofing:** By abstracting the Pub/Sub logic behind the `EventBus` interface, **switching to Kafka** requires simply writing a `KafkaEventBus` implementation and changing a single export. No business logic needs to be rewritten.

## 4. Distributed Rate Limiting (Token Bucket Algorithm)
**Problem:** A malicious or buggy client sending thousands of requests per second could overwhelm the database and bring the backend down. Using in-memory rate limiting variables fails when traffic is load-balanced across multiple Node.js instances.
**Solution:**
- **Algorithm:** The Token Bucket algorithm, which gracefully handles request bursts while mathematically smoothing traffic over time.
- **Implementation:** A robust Express middleware (`rateLimiter`) was built utilizing a single, shared Redis instance as the centralized source of truth.
- **Atomicity via Lua Script:** To avoid Time-Of-Check to Time-Of-Use race conditions during high concurrency, the token math is processed entirely inside a Redis Lua script (`redisClient.eval`). Redis runs scripts atomically, guaranteeing thread safety.
- **Auto-Cleanup (TTL):** The Lua script dynamically applies a Time-To-Live (TTL) matching `(capacity / refillRate) + 60s` to automatically flush inactive users from memory.
- **Route Protections:** Implemented across the API:
  - Auth: Login (5/min), Register (3/min)
  - Tweets: Create (20/min)
  - Comments: Create (60/min)
  - Likes: Toggle (200/min)
  - Search: Users/Tweets (100/min)

---

### Next Steps: Migration to Kafka
While Redis Pub/Sub is incredibly fast, it lacks **Message Persistence** (messages are lost if the subscriber is offline). The next architectural iteration involves replacing the `RedisEventBus` with a Kafka implementation to guarantee reliable event streaming, message replays, and robust microservice communication.
