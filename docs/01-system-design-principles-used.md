# 🏗️ System Design Principles Used Till Now

This document details all the architectural and software system design principles, engineering patterns, and best practices applied in building this backend from ground zero to feature completion.

---

## 1. Modular Monolith Architecture (Feature-Based Packaging)

Instead of organizing code horizontally by technical layers (e.g., placing all 50 controllers in one `/controllers` directory and all services in another), this backend is architected as a **Modular Monolith**.

### How It Works:
- Code is structured by business domain features under `src/modules/`:
  - `auth/`, `user/`, `follow/`, `tweet/`, `like/`, `comment/`, `feed/`, `search/`, `notification/`, `media/`, `retweet/`, `hashtag/`
- Every module is a self-contained unit with its own routes, controller, service, repository, and select definitions.

### Why Why Used This Principle:
- **High Cohesion & Low Coupling:** Everything related to a feature lives together. Modifying the Tweet module does not risk breaking the User or Follow modules.
- **Microservices Readiness:** If the system scales to millions of users and the Feed or Media service needs independent scaling, that module can be lifted out into an independent microservice with virtually zero refactoring.

---

## 2. Layered Architecture (Separation of Concerns & Single Responsibility Principle)

Within every module, we strictly enforce a **4-Tier Layered Architecture**. Each layer has a single, well-defined responsibility:

```
[ HTTP Request ]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ 1. Routes Layer (*.routes.ts)                          │
│    • Defines HTTP verbs (GET, POST, DELETE)            │
│    • Attaches middleware (Authentication, Multer)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Controller Layer (*.controller.ts)                  │
│    • Extracts params, queries, and body from req       │
│    • Wraps execution in asyncHandler for safety        │
│    • Sends standardized JSON HTTP responses (200, 201) │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Service Layer (*.service.ts)                        │
│    • Contains 100% of the core Business Logic          │
│    • Verifies ownership (e.g., "Can user edit this?")  │
│    • Throws domain AppError (404, 403, 409)            │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Repository Layer (*.repository.ts)                  │
│    • Pure database abstraction (Prisma ORM calls)      │
│    • Executes optimized SQL queries and joins          │
│    • Never knows about HTTP requests or business rules │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
                   [ PostgreSQL Database ]
```

### Key Benefit:
By isolating database calls in repositories and business rules in services, we can test business logic independently or swap PostgreSQL for another database without changing a single line of controller or route code.

---

## 3. Idempotency & Database-Level Data Integrity

In distributed systems and social networks, network retries or double-clicks can cause users to accidentally send duplicate requests (e.g., clicking "Like" or "Retweet" twice in 50 milliseconds).

### How We Solved This:
- **Composite Primary Keys (`@@id`):**
  - In `Like`, `Retweet`, and `Follow`, we use composite primary keys: `@@id([userId, tweetId])` or `@@id([followerId, followingId])`.
  - The database engine guarantees at the storage level that a user can never like or retweet the same tweet twice. Duplicate attempts are rejected instantly without race conditions.
- **Cascade Deletion (`onDelete: Cascade`):**
  - All foreign keys (likes, comments, media, retweets, notifications) are configured with cascade deletion. When a user or tweet is deleted, the database automatically cleans up all orphan records, preventing memory leaks and dangling pointers.

---

## 4. DRY (Don't Repeat Yourself) & Shared Infrastructure

We centralized cross-cutting concerns in `src/common/` to keep module code lean and readable:
- **Centralized Error Handling (`error.middleware.ts` & `AppError`):** Instead of writing `try/catch` blocks and standardizing error responses in 50 different endpoints, all errors bubble up to a single global error handler that returns uniform JSON error payloads.
- **Async Execution Wrapper (`async-handler.ts`):** Eliminates unhandled promise rejections across Express routes.
- **Centralized Authentication (`auth.middleware.ts`):** Verifies stateless JWT tokens and populates `req.user` seamlessly.
- **Optimized Field Selection (`*.select.ts`):** We never do `SELECT *` on user tables. We export reusable select objects (e.g., `userSelect`) that only pull `id`, `username`, and `profileImage`, preventing accidental exposure of password hashes.

---

## 5. Tailored Pagination Strategies (Cursor vs. Offset)

To handle massive datasets efficiently, we implemented two distinct pagination principles based on data velocity:

| Strategy | Where Used | Why It Was Chosen |
| :--- | :--- | :--- |
| **Cursor Pagination** | User Tweets, Timeline Feed | High-velocity streams where new tweets arrive every second. Offset pagination would cause duplicate or skipped tweets when items are added to the top of the feed. Cursors (`take`, `skip: 1`, `cursor: { id }`) guarantee rock-solid stream consistency. |
| **Offset Pagination** | Likes List, Comments, Retweets, Hashtags | Bounded or static lists where users navigate by pages (`page=1&limit=10`). Easy to compute total pages and jump around. |

---

## 6. Stateless Authentication & Horizontal Scalability

- **Stateless JWT:** Authentication tokens are self-contained and cryptographically signed. API servers do not store user session state in server memory.
- **Why This Matters:** Because servers are stateless, we can spin up 10, 50, or 100 API server instances behind a load balancer. Any server instance can process any request from any user without session affinity or synchronization bottlenecks.
