# 📋 Functional and Non-Functional Requirements

This document outlines the complete specifications of the Twitter Backend system, categorized into **Functional Requirements (what the system does)** and **Non-Functional Requirements (how well the system performs)**.

---

## 1. Functional Requirements (FRs)

The system provides 11 distinct feature modules, completely fulfilling the requirements of a modern social media platform:

### 🔐 1. Authentication & Authorization Module
- **FR-1.1:** Users can register an account using email, username, and password.
- **FR-1.2:** System securely hashes passwords using `bcrypt` before database storage.
- **FR-1.3:** Users can login to receive stateless JSON Web Tokens (Access Token + Refresh Token).
- **FR-1.4:** Protected endpoints verify JWT validity via middleware and reject unauthorized access with HTTP `401 Unauthorized`.

### 👤 2. User Management Module
- **FR-2.1:** Users can view any public user profile by ID or username.
- **FR-2.2:** Authenticated users can update their bio, location, website, and profile image.
- **FR-2.3:** System returns real-time follower, following, and tweet counts on profile queries.

### 🤝 3. Social Graph (Follow System) Module
- **FR-3.1:** Users can follow or unfollow other users.
- **FR-3.2:** System prevents self-following and duplicate follow relationships.
- **FR-3.3:** Users can retrieve paginated lists of followers and users they are following.

### 📝 4. Tweet Module
- **FR-4.1:** Users can publish new text tweets (up to 280 characters).
- **FR-4.2:** Users can retrieve a specific tweet with author details and metadata.
- **FR-4.3:** Authors can edit or delete their own tweets (enforcing strict ownership authorization).
- **FR-4.4:** System provides cursor-paginated timelines of a specific user's tweets.

### ❤️ 5. Like Module
- **FR-5.1:** Users can like or unlike any tweet.
- **FR-5.2:** System prevents double-liking via composite primary key constraints.
- **FR-5.3:** Users can retrieve total like counts and paginated lists of users who liked a tweet.

### 💬 6. Comment Module
- **FR-6.1:** Users can reply/comment on existing tweets.
- **FR-6.2:** Comment authors can edit or delete their comments.
- **FR-6.3:** Users can retrieve offset-paginated comment threads for any tweet.

### 🔁 7. Retweet Module
- **FR-7.1:** Users can retweet or undo retweets on any tweet.
- **FR-7.2:** System establishes a relational link without duplicating tweet content text.
- **FR-7.3:** Users can retrieve retweet counts and lists of users who retweeted.

### #️⃣ 8. Hashtag Module
- **FR-8.1:** System automatically extracts `#hashtags` from tweet content using regex upon creation or update.
- **FR-8.2:** Hashtags are normalized to lowercase and deduplicated per tweet automatically.
- **FR-8.3:** Users can query top trending hashtags ranked by tweet volume.
- **FR-8.4:** Users can search hashtags for autocomplete suggestions and view all tweets tagged with a specific hashtag.

### 🖼️ 9. Media Upload Module
- **FR-9.1:** Users can attach images and videos to tweets using multipart form-data uploads.
- **FR-9.2:** Files are processed locally via Multer and streamed to Cloudinary CDN for cloud storage.
- **FR-9.3:** Temporary local server files are automatically unlinked (deleted) post-upload to conserve disk space.

### 🔔 10. Notification Module
- **FR-10.1:** System automatically triggers event notifications when a user is followed, liked, commented on, or retweeted.
- **FR-10.2:** Users can retrieve paginated lists of notifications, mark individual/all as read, or delete notifications.

### 📰 11. Feed & Search Module
- **FR-11.1:** System generates a personalized Home Timeline feed merging tweets from followed users and the user's own tweets.
- **FR-11.2:** Home feed utilizes cursor pagination for real-time infinite scroll without duplicate items.
- **FR-11.3:** Users can perform global search across tweets (content matching) and users (username matching).

---

## 2. Non-Functional Requirements (NFRs)

Non-Functional Requirements define the quality attributes, architectural constraints, and operational standards of the system.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      NON-FUNCTIONAL REQUIREMENTS                       │
├─────────────────┬─────────────────┬─────────────────┬──────────────────┤
│  ⚡ Performance  │ 📈 Scalability  │  🛡️ Security   │ 🔄 Consistency   │
│  <100ms reads   │ 10M+ DAU ready  │ Bcrypt + Helmet │ Hybrid Model     │
└─────────────────┴─────────────────┴─────────────────┴──────────────────┘
```

### ⚡ 1. Performance & Low Latency
- **NFR-1.1:** Read operations (fetching profiles, single tweets, comments) must complete in `< 100 milliseconds` (p95 latency).
- **NFR-1.2:** Write operations (posting tweets, liking, following) must complete in `< 200 milliseconds`.
- **NFR-1.3:** Database queries must avoid full table scans by utilizing B-tree indexing on foreign keys and lookup columns.

### 📈 2. Scalability & Elasticity
- **NFR-2.1:** The backend must support horizontal scaling. API servers must remain completely stateless so traffic can be distributed across arbitrary instances via load balancers.
- **NFR-2.2:** Database schema must support read-replication and partitioning without schema redesigns.

### 🛡️ 3. Security & Privacy
- **NFR-3.1:** Passwords must never be stored in plain text; must use `bcrypt` encryption with strong salt rounds.
- **NFR-3.2:** All API endpoints must be protected against Cross-Site Scripting (XSS), SQL Injection (prevented via Prisma ORM parameterized queries), and MIME-sniffing using `helmet` HTTP headers.
- **NFR-3.3:** Cross-Origin Resource Sharing (CORS) must be strictly configured to allow only trusted frontend origins.
- **NFR-3.4:** Sensitive data (password hashes, refresh tokens) must be stripped from DTOs and API JSON responses.

### 🔄 4. Consistency Models (Hybrid Strategy)
- **NFR-4.1 (Strong Consistency):** Required for authentication, account creation, password changes, and composite primary key enforcement (preventing duplicate likes/retweets). When a user likes a tweet, that write must be atomic and immediately durable.
- **NFR-4.2 (Eventual Consistency):** Acceptable for Home Timeline feed generation, follower count badges, and trending hashtag analytics. A propagation delay of 1–2 seconds for a tweet to appear in 1 million followers' feeds is an acceptable engineering trade-off for high availability.

### 🟢 5. Availability & Fault Tolerance
- **NFR-5.1:** System target availability is **99.99% Uptime** (allowing less than 52 minutes of unplanned downtime per year).
- **NFR-5.2:** Graceful Degradation: If secondary systems (like Cloudinary media upload or background notifications) experience outages, core tweeting and feed viewing must continue to function uninterrupted.

### 🛠️ 6. Maintainability & Code Quality
- **NFR-6.1:** Strict adherence to TypeScript static typing; zero usage of `any` types in domain logic.
- **NFR-6.2:** All errors must be logged with timestamp, request path, and stack trace via structured HTTP logging (`httpLogger`).
