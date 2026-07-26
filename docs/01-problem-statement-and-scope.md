# Chapter 1. Problem Statement & Scope

> **What are we building?** A high-level guide to what our Twitter-like backend will do in Version 1, and why we draw clear boundaries around our features.

---

## 1. The Core Challenge

Building a social media platform like Twitter is like building a highway system during rush hour. You have two massive challenges happening at the exact same time:
1. **Massive Incoming Traffic (Writes)**: Thousands of people tweeting, liking, and commenting every second.
2. **Instant Feed Loading (Reads)**: When a celebrity tweets to 5 million followers, all 5 million people expect to see that tweet on their home timeline immediately without the app spinning or crashing!

To solve this, we need a clean **High-Level System Design**. We must define exactly what we are building right now (**In Scope**) and what we will save for future updates (**Out of Scope**).

---

## 2. What We Are Building (Version 1 Scope)

For our first release, we focus on perfecting the **7 Core Pillars** of a real social network:

### 1. 👤 User Accounts & Profiles
* Sign up securely with an email, username, and password.
* Log in and stay logged in safely without re-typing passwords.
* View public user profiles, update bios, and upload profile pictures.

### 2. 📝 Tweets & Content
* Publish text tweets (up to 280 characters) with optional attached photos.
* View individual tweets along with their author details and interaction counts.
* Delete your own tweets safely (which automatically removes associated comments and likes).

### 3. 🤝 The Social Graph (Followers)
* Follow and unfollow other user accounts.
* View paginated lists of who a user is following and who follows them.

### 4. 📰 Home Timeline & Feeds
* **Home Timeline**: A personalized, real-time feed showing the newest tweets from all the accounts you follow.
* **User Timeline**: A profile page feed showing all tweets posted by a specific person.

### 5. ❤️ Engagement (Likes & Comments)
* Like and unlike tweets with instant counter updates (preventing double-likes!).
* Write, view, and delete threaded replies on tweets.

### 6. 🔔 Real-Time Notifications
* Get alerted automatically when someone follows you, likes your tweet, or replies to you.
* See how many unread notifications you have and mark them as read.

### 7. 🔍 Discovery & Media
* Search for user accounts by username or display name.
* Securely upload image files to AWS S3 storage and link them to tweets.

---

## 3. What We Are Leaving Out for Now (Future Scope)

To keep our architecture clean and avoid "feature creep," we intentionally leave out complex features that require specialized video servers or heavy machine learning algorithms:

| Deferred Feature | Why We Save It for Later | Target Version |
| :--- | :--- | :--- |
| **Video & Live Streaming** | Requires complex video processing (transcoding) and dedicated streaming media servers. | **Version 2** |
| **24-Hour Stories** | Requires temporary data expiration timers and automatic garbage collection. | **Version 2** |
| **AI "For You" Recommendations**| Requires complex machine learning models and tracking user viewing habits. | **Version 3** |
| **Real-Time Trending Topics** | Requires high-speed data analytics engines constantly counting hashtag frequencies. | **Version 3** |
| **Direct Messaging (Chat)** | Requires real-time WebSocket servers and end-to-end encryption. | **Version 2** |

---

## 4. How We Know We Succeeded

Our system design is a success if our backend meets these three simple rules:
1. **Clean Boundaries**: Our web server routing code never writes raw database queries, and our database code never touches web HTTP headers.
2. **Server Independence (Statelessness)**: We can restart or add 10 new API servers without logging out a single user!
3. **Rock-Solid Security**: Zero passwords are ever stored as plain text, and users can never delete or modify someone else's tweets.
