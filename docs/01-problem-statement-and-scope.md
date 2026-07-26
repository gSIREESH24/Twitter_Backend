# Chapter 1. Problem Statement & Scope

> **Objective**: Design and build a scalable, production-grade Twitter-like backend service that supports millions of concurrent users while strictly adhering to industry-standard system design principles and software engineering best practices.

---

## 1.1 The Challenge

Building a social media platform like Twitter is one of the classic challenges in distributed systems engineering. The core difficulty lies in balancing two conflicting demands:
1. **High Write Throughput**: Millions of users simultaneously publishing tweets, liking, commenting, and following others.
2. **Low-Latency Read Fan-out**: When a celebrity with 5 million followers posts a tweet, that tweet must appear on 5 million individual home feeds almost instantaneously without overwhelming the database.

This document defines the exact boundaries of what our system will accomplish in **Version 1 (V1)** and explicitly boundaries out advanced features for future iterations.

---

## 1.2 In-Scope Functional Scope (Version 1)

Our V1 architecture focuses on perfecting the foundational pillars of a high-performance social networking service:

### 1. User Account & Profile Management
*   **Authentication**: Secure user registration, login, token refresh, and logout using JSON Web Tokens (JWT) and Argon2/bcrypt password hashing.
*   **Profile Management**: Viewing public profiles, updating bio/display names, and uploading profile avatars.

### 2. Tweet Lifecycle
*   **Publishing**: Creating text tweets (up to 280 characters) with optional attached media (images).
*   **Retrieval**: Fetching single tweets with complete metadata (author details, like count, comment count, timestamp).
*   **Deletion**: Secure removal of tweets by their rightful owners, cascading deletions to likes and comments.

### 3. Social Graph & Relationships
*   **Following System**: Unidirectional follow and unfollow mechanisms between users.
*   **Graph Queries**: Retrieving paginated lists of a user's followers and who they are following.

### 4. Timeline & Feed Generation
*   **Home Feed (Timeline)**: A real-time, chronological stream of tweets authored by the accounts a user follows.
*   **User Timeline**: A chronological list of tweets published by a specific author.

### 5. Engagement & Social Interaction
*   **Likes**: Liking and unliking tweets with real-time counter updates and duplicate prevention.
*   **Comments**: Publishing, viewing, and deleting threaded replies on tweets.

### 6. Notifications System
*   **Event-Driven Alerts**: Generating real-time notification events when a user is followed, liked, or commented on.
*   **Read State Management**: Querying unread notifications and marking notifications as read.

### 7. Discovery & Search
*   **Text Search**: Searching for user accounts by username/display name and searching tweets by keywords.

### 8. Multimedia Handling
*   **Image Attachment**: Generating secure pre-signed URLs for uploading images to object storage (AWS S3) and linking media URLs to tweets.

---

## 1.3 Out of Scope (Future Iterations)

To prevent scope creep and ensure our engineering focus remains on core scalability and clean architectural layering, the following features are explicitly deferred to subsequent versions:

| Excluded Feature | Reason for Deferral | Target Version |
| :--- | :--- | :--- |
| **Video & Live Audio Streaming** | Requires complex HLS/DASH video transcoding pipelines and dedicated media streaming servers. | **Version 2** |
| **Ephemeral Stories (24h expiry)** | Requires specialized TTL-based data storage and heavy automated garbage collection pipelines. | **Version 2** |
| **AI Recommendation Algorithm** | Requires ML feature engineering, collaborative filtering pipelines, and vector database integration. | **Version 3** |
| **Real-time Trending Topics** | Requires stream processing engines (e.g., Apache Flink) running sliding-window word frequency algorithms. | **Version 3** |
| **Direct Messaging (E2EE Chat)** | Requires dedicated WebSockets/WebRTC infrastructure and End-to-End Encryption key exchange protocols. | **Version 2** |
| **Retweets & Quote Tweets** | Adds complex recursive entity referencing; deferred to focus on core engagement primitives first. | **Version 1.5** |

---

## 1.4 Success Criteria

The design and implementation of Version 1 will be considered successful when it meets the following engineering criteria:
1.  **Zero Mixed Layers**: Not a single SQL query appears in a controller, and no HTTP request object is passed into a service layer.
2.  **Stateless API**: Any server instance can be killed or restarted without logging out users or losing pending request state.
3.  **Testability**: Service layer business logic can be unit tested in isolation using mock repository interfaces without spinning up a live database.
4.  **Security**: No plaintext passwords exist anywhere in the system, and all API endpoints enforce appropriate authentication and authorization rules.
