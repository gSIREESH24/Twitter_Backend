# Chapter 5. Database Design & SQL Schema

> **Objective**: Provide exact, production-ready PostgreSQL Data Definition Language (DDL) schemas, establish strict indexing strategies for sub-millisecond query performance, explain our normalization and selective denormalization trade-offs, and define transaction concurrency controls.

---

## 5.1 Why PostgreSQL?

We select **PostgreSQL** as our primary relational database over NoSQL alternatives (like MongoDB or Cassandra) for Version 1 because:
1.  **ACID Transactional Integrity**: Social networking actions (e.g., following a user while incrementing follower counters) require strict atomic transactions to prevent data drift and orphaned records.
2.  **Relational Graph Integrity**: Strict foreign key constraints with cascading rules (`ON DELETE CASCADE`) automatically guarantee that deleting a user account cleanly scrubs all associated tweets, likes, and comments without manual cleanup scripts.
3.  **Advanced Indexing Capabilities**: PostgreSQL supports B-Tree, Hash, GIN, and Partial indexes, enabling lightning-fast cursor pagination and text search queries over millions of rows.

---

## 5.2 Production DDL SQL Schema

The following production-grade DDL scripts define our exact table structures, UUID primary keys, check constraints, and default timestamp generation:

```sql
-- Enable UUID extension for generating cryptographically random IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. USERS TABLE
--------------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    bio VARCHAR(160) DEFAULT '',
    profile_image_url VARCHAR(512) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_username_length CHECK (char_length(username) >= 3)
);

--------------------------------------------------------------------------------
-- 2. TWEETS TABLE (With Denormalized Counters)
--------------------------------------------------------------------------------
CREATE TABLE tweets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content VARCHAR(280) NOT NULL,
    likes_count INTEGER DEFAULT 0 NOT NULL,
    comments_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_content_not_empty CHECK (char_length(trim(content)) > 0),
    CONSTRAINT chk_likes_non_negative CHECK (likes_count >= 0),
    CONSTRAINT chk_comments_non_negative CHECK (comments_count >= 0)
);

--------------------------------------------------------------------------------
-- 3. FOLLOWS TABLE (Junction Table for Social Graph)
--------------------------------------------------------------------------------
CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id)
);

--------------------------------------------------------------------------------
-- 4. LIKES TABLE (Junction Table for Tweet Engagement)
--------------------------------------------------------------------------------
CREATE TABLE likes (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tweet_id UUID NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tweet_id)
);

--------------------------------------------------------------------------------
-- 5. COMMENTS TABLE
--------------------------------------------------------------------------------
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tweet_id UUID NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
    content VARCHAR(280) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_comment_not_empty CHECK (char_length(trim(content)) > 0)
);

--------------------------------------------------------------------------------
-- 6. NOTIFICATIONS TABLE
--------------------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- e.g., 'FOLLOW', 'LIKE', 'COMMENT'
    reference_id UUID DEFAULT NULL, -- references tweet_id or follow_id
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- 7. MEDIA TABLE
--------------------------------------------------------------------------------
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tweet_id UUID NOT NULL REFERENCES tweets(id) ON DELETE CASCADE,
    media_url VARCHAR(512) NOT NULL,
    media_type VARCHAR(50) DEFAULT 'image/jpeg' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5.3 Index Design & Performance Strategy

Without proper indexing, database queries degrade from $O(\log N)$ B-Tree lookups to catastrophic $O(N)$ full table scans as the database grows to millions of rows. We define explicit indexes optimized for our exact query access patterns:

```sql
-- 1. Optimize User Profile Lookups by Username & Email
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 2. CRITICAL: Composite Index for User Timeline Retrieval (Cursor Pagination)
-- Allows instant fetching of a user's tweets ordered by newest first without sorting in memory
CREATE INDEX idx_tweets_user_created ON tweets(user_id, created_at DESC);

-- 3. Optimize Social Graph Queries (Who is following whom?)
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- 4. Optimize Comment Retrieval for a specific Tweet
CREATE INDEX idx_comments_tweet_created ON comments(tweet_id, created_at ASC);

-- 5. Optimize Unread Notification Badge Counts & Feed
CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC);

-- 6. Optimize Media lookups when joining with Tweets
CREATE INDEX idx_media_tweet_id ON media(tweet_id);
```

### Why Composite Index `(user_id, created_at DESC)` is Mandatory
When fetching a user's profile timeline (`SELECT * FROM tweets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`), a simple index on `user_id` would require PostgreSQL to find all matching rows and then execute an expensive in-memory sort operation. By creating a **composite index** that pre-sorts by `created_at DESC` within each `user_id` bucket, the query executes in sub-millisecond time by reading directly from the index leaves!

---

## 5.4 Normalization vs. Selective Denormalization

Our schema strictly adheres to **3rd Normal Form (3NF)** to eliminate data redundancy, with one deliberate engineering exception: **Denormalized Engagement Counters**.

### The Problem with 100% Normalization
In a purely normalized database, finding how many likes a tweet has requires executing an aggregate query:
```sql
SELECT COUNT(*) FROM likes WHERE tweet_id = '123e4567-e89b-12d3-a456-426614174000';
```
When a viral tweet reaches 500,000 likes, executing a `COUNT(*)` query every time the tweet is viewed on a timeline would instantly cause 100% CPU utilization on PostgreSQL!

### The Denormalization Solution
We store explicit integer columns `likes_count` and `comments_count` directly inside the `tweets` table.
*   **When a user likes a tweet**: We insert the like record and atomically increment the counter inside a single SQL transaction:
    ```sql
    BEGIN;
    INSERT INTO likes (user_id, tweet_id) VALUES ($1, $2);
    UPDATE tweets SET likes_count = likes_count + 1 WHERE id = $2;
    COMMIT;
    ```
*   **When reading a feed**: The like count is retrieved instantly as a simple integer attribute without executing any `COUNT(*)` joins!

---

## 5.5 Transactional Concurrency & Race Conditions

In high-concurrency environments, two users might click "Like" on the exact same millisecond, or a user might double-click the like button rapidly.

### Preventing Duplicate Likes (Unique Constraint Protection)
Because our `likes` table enforces a **Composite Primary Key on `(user_id, tweet_id)`**, the database kernel itself prevents duplicate likes at the storage engine level. If a double-submit occurs, PostgreSQL throws a `23505 Unique Violation` error, which our Repository layer catches and cleanly ignores without corrupting counters.

### Preventing Counter Drift (Row-Level Locking)
To ensure concurrent counter updates never overwrite each other, we rely on PostgreSQL's atomic UPDATE syntax (`likes_count = likes_count + 1`), which automatically applies a **Row-Level Exclusive Lock (`FOR UPDATE`)** on the target tweet row for the duration of the microsecond update, guaranteeing 100% mathematical accuracy.
