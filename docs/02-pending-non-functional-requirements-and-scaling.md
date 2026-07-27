# 🚀 Pending Non-Functional Requirements & Future Scaling Architecture

Now that the backend is **100% functional and feature-complete**, we must examine the **System Design & Non-Functional Requirements (NFRs)** required to transition this modular monolith into a hyper-scalable, fault-tolerant distributed system capable of handling 10+ Million Daily Active Users (DAU).

---

## 1. Asynchronous Fan-Out Architecture (The Celebrity Problem)

### The Current Limitation:
Currently, when a user posts a tweet, the database operations execute synchronously within the HTTP request cycle. If a normal user with 20 followers posts a tweet, updating timelines takes ~5 milliseconds. However, if a celebrity with **5 Million followers** tweets, attempting to update 5 million follower timelines synchronously during the API call will cause the HTTP request to time out and crash the server.

### The Pending Architecture (Apache Kafka Event Bus):
We need to implement an **Asynchronous Event-Driven Architecture** using Apache Kafka or RabbitMQ.

```
[ Client ] ──(POST /tweets)──► [ Express API ] ──(Write Tweet to DB)──► [ PostgreSQL ]
                                     │
                               (Emit Event in <10ms)
                                     ▼
                           [ 📬 Apache Kafka Bus ]
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
[ 👷 Fan-Out Worker ]                                  [ 🔔 Notification Worker ]
Pushes tweet ID into 5,000,000                         Sends push/email notifications
followers' Redis Home Timelines                        in the background asynchronously
```

- **Fan-out on Write (Push Model):** For users with < 10,000 followers, background workers push the new tweet ID into each follower's Redis timeline cache.
- **Fan-out on Read (Pull Model):** For celebrities (> 10,000 followers), we do not push to all timelines. Instead, when a follower loads their feed, the system merges their standard timeline with recent tweets from celebrities they follow.

---

## 2. In-Memory Distributed Caching (Redis Cluster)

### The Current Limitation:
Every home feed request, user profile view, and trending hashtag check currently queries PostgreSQL directly. At 10,000 requests per second, database disk I/O and CPU will saturate.

### The Pending Architecture:
We must introduce **Redis** as a distributed, in-memory caching layer:
1. **Home Timeline Caching:** Store user feeds in Redis Sorted Sets (`ZSET`), scored by timestamp. Loading a feed becomes an O(log N) in-memory lookup taking `< 2 milliseconds`.
2. **Session & Token Management:** Cache active user sessions and store blocklisted/revoked JWT refresh tokens for instant logout verification.
3. **Trending Hashtags:** Use Redis `ZINCRBY` on a sorted set for real-time, lightning-fast hashtag trend calculations without running heavy database `groupBy` aggregation queries.

---

## 3. Database Scaling (Read Replicas & Sharding)

### The Current Limitation:
We currently operate on a single PostgreSQL primary database instance handling both reads and writes.

### The Pending Architecture:
Social networks exhibit a **100:1 Read-to-Write Ratio** (for every 1 tweet posted, 100 people read it).
1. **Primary-Replica Replication:**
   - **Primary DB:** Handles all WRITE operations (INSERT, UPDATE, DELETE).
   - **Read Replicas (5+ Instances):** Handle 100% of READ queries (SELECT). Database replication keeps them synchronized with the primary in near real-time.
2. **Database Sharding (Horizontal Partitioning):**
   - When table sizes exceed terabytes, we partition the `Tweet` and `Feed` tables across multiple database servers (shards) hashed by `userId` or time ranges.

---

## 4. Rate Limiting & DDoS Protection

### The Current Limitation:
An attacker could write a script to call `POST /api/v1/tweets` 1,000 times per second or brute-force login endpoints.

### The Pending Architecture:
Implement **Redis-Backed Rate Limiting** (using Token Bucket or Leaky Bucket algorithms) at the API Gateway layer:
- **Authentication Endpoints:** Limit to 5 failed login attempts per 15 minutes per IP.
- **Tweet Creation:** Limit to 50 tweets per hour per authenticated user.
- **Feed Queries:** Limit to 300 requests per 15 minutes per user.

---

## 5. Content Delivery Network (CDN) & Edge Optimization

### The Current Limitation:
While media files are uploaded to Cloudinary, global users still experience latency depending on routing to origin storage.

### The Pending Architecture:
Front all media assets and static payloads with a global **CDN (Cloudflare / AWS CloudFront)**:
- Caches images and videos at Edge Locations in 200+ cities worldwide.
- Reduces network latency for media loading from ~300ms to `< 15ms`.

---

## 6. Observability, Distributed Tracing & Monitoring

To guarantee 99.99% uptime in production, we need full system visibility:
1. **Metrics (Prometheus + Grafana):** Track API response times (p95, p99 latency), HTTP error rates (4xx vs 5xx), database connection pool health, and memory/CPU utilization.
2. **Distributed Tracing (OpenTelemetry / Jaeger):** Trace a single user request as it travels through Nginx, API Gateways, Kafka workers, and PostgreSQL shards to pinpoint bottlenecks.
3. **Centralized Logging (ELK Stack / Datadog):** Aggregate structured JSON logs across all server instances for rapid debugging during outages.

---

## 7. Containerization & Kubernetes Orchestration

- **Docker:** Containerize the API application, workers, and database dependencies into reproducible, lightweight Docker images.
- **Kubernetes (K8s):** Deploy containers across a Kubernetes cluster utilizing **Horizontal Pod Autoscalers (HPA)**. When traffic spikes during a major news event, K8s automatically spins up 50 new API container pods in seconds, and spins them down when traffic subsides to save cloud costs.
