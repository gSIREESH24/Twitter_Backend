# Chapter 5. Database Design & Schemas

> **How do we store permanent data?** A high-level guide to our table structures, why we index columns for fast searching, and how we count likes without slowing down the database.

---

## 1. Why We Chose PostgreSQL (Relational Database)

There are two main types of databases in software engineering: NoSQL (like MongoDB) and Relational SQL (like PostgreSQL). For Version 1 of our social network, we choose **PostgreSQL** because:

1. **Safety First (ACID Guarantees)**: When someone clicks "Follow", two things happen: we create a follow link, and we increase their follower count. PostgreSQL guarantees both actions succeed together or fail together—never leaving broken data!
2. **Automatic Cleanup (Cascading Deletes)**: If a user deletes their account, PostgreSQL automatically wipes out all their tweets, likes, and comments for us without leaving messy orphaned data behind.
3. **Powerful Indexing**: PostgreSQL allows us to create specialized search indexes (like the index at the back of a textbook), allowing us to find a user's newest tweets in a fraction of a millisecond!

---

## 2. High-Level Table Structures

Here is a clean, simple breakdown of what we store inside our primary database tables:

### 👤 1. Users Table
Stores account identity and public profile details.

| Field Name | Data Type | High-Level Purpose |
| :--- | :--- | :--- |
| `id` | UUID | Unique random identifier for the user account. |
| `username` | String (30) | Unique display handle (e.g., `@sireesh_dev`). |
| `email` | String (255) | Unique email address used for login and alerts. |
| `password_hash` | String | The secure, unreadable hashed password string. |
| `bio` | String (160) | Short public profile description. |
| `profile_image_url`| String | URL pointing to their avatar photo stored in AWS S3. |
| `created_at` | Timestamp | Exact date and time the account was registered. |

---

### 📝 2. Tweets Table
Stores short messages and attached counter metrics.

| Field Name | Data Type | High-Level Purpose |
| :--- | :--- | :--- |
| `id` | UUID | Unique identifier for the tweet. |
| `user_id` | UUID | Links to the author who wrote this tweet. |
| `content` | String (280) | The text message of the tweet ($\le 280$ characters). |
| `likes_count` | Integer | **Direct counter** tracking total likes received. |
| `comments_count`| Integer | **Direct counter** tracking total reply comments. |
| `created_at` | Timestamp | Exact timestamp when the tweet was published. |

---

### 🤝 3. Follows Table (Social Graph)
A simple junction table linking followers to the accounts they follow.

| Field Name | Data Type | High-Level Purpose |
| :--- | :--- | :--- |
| `follower_id` | UUID | The user who clicked the "Follow" button. |
| `following_id` | UUID | The target account being subscribed to. |
| `created_at` | Timestamp | Timestamp when the follow relationship started. |

> 💡 **Rule**: Together, `(follower_id, following_id)` form a unique pair so you can never follow the same person twice!

---

### ❤️ 4. Likes & 💬 5. Comments Tables
Tracks user engagement on published tweets.

* **Likes Table**: Stores pairs of `(user_id, tweet_id)`. The database enforces uniqueness so a user cannot double-like a tweet!
* **Comments Table**: Stores `id`, `user_id`, `tweet_id`, and `content` (up to 280 characters of text reply).

---

## 3. Why Indexing is a Superpower (Making Queries Fast)

Imagine looking for the word "Architecture" in a 1,000-page textbook. If there is no index, you have to read every single page one by one! But if you flip to the alphabetical index at the back, you find the exact page number instantly.

In our database, we create **B-Tree Indexes** on frequently searched columns:
* **Username & Email**: Finds user login accounts instantly during sign-in.
* **Timeline Index `(user_id, created_at DESC)`**: This is our most critical index! When a user loads a profile timeline, PostgreSQL uses this index to grab their newest 20 tweets in **under 2 milliseconds**, without sorting rows in memory!

---

## 4. Why We Store Counters Directly on Tweets (Denormalization)

In a traditional database design, if you want to know how many likes a tweet has, you ask the database to count them:
```sql
-- Slow approach: Counting hundreds of thousands of rows every time!
SELECT COUNT(*) FROM likes WHERE tweet_id = '123...';
```
If a viral tweet reaches 500,000 likes, running a count query every time someone views their feed would melt our database CPU!

### The High-Level Solution
We store an explicit integer column called `likes_count` directly inside the `Tweets` table!
* When someone clicks "Like", we insert the like record and add $+1$ to `likes_count` instantly.
* When someone views a timeline, we just read the number directly from `likes_count` with zero heavy counting required!
