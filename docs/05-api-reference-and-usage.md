# 🌐 Complete API Reference & Usage Guide

This document lists all available REST API endpoints in the Twitter Backend, their functionality defined in **One Word**, and practical instructions on how to use them (including headers, request bodies, queries, and example responses).

---

## 🔑 Authentication Rules

Whenever an endpoint states **Auth: Yes**, you must include the JWT Access Token in the HTTP request headers:
```http
Authorization: Bearer <your_access_token_here>
```

---

## 1. 🔐 Authentication (`/api/v1/auth`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/auth/register` | **Register** | No | **Body:** `{ "email": "alice@test.com", "username": "alice", "password": "Password123!" }`<br>**Returns:** `201 Created` with user ID, email, and username. |
| `POST` | `/api/v1/auth/login` | **Login** | No | **Body:** `{ "email": "alice@test.com", "password": "Password123!" }` (or use `"username"`).<br>**Returns:** `200 OK` with `{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }`. |
| `POST` | `/api/v1/auth/refresh-token` | **Refresh** | No | **Body:** `{ "refreshToken": "eyJ..." }`<br>**Returns:** `200 OK` with a new `accessToken`. |
| `POST` | `/api/v1/auth/logout` | **Logout** | Yes | **Body:** `{ "refreshToken": "eyJ..." }`<br>**Returns:** `200 OK` `{ "message": "Logged out successfully" }`. |

---

## 2. 👤 User Management (`/api/v1/users`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/users/:id` | **ViewProfile** | No | **Params:** `:id` can be user ID or username (`/api/v1/users/alice`).<br>**Returns:** `200 OK` with user details, follower count, following count, and tweet count. |
| `PUT` | `/api/v1/users/profile` | **UpdateProfile**| Yes | **Body:** `{ "bio": "Software Engineer", "location": "NYC", "website": "https://alice.dev" }`<br>**Returns:** `200 OK` with updated profile object. |

---

## 3. 🤝 Social Graph / Follow (`/api/v1/users`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/users/:id/follow` | **Follow** | Yes | **Params:** `:id` of target user to follow.<br>**Returns:** `201 Created` `{ "message": "User followed successfully" }`. |
| `DELETE` | `/api/v1/users/:id/follow` | **Unfollow** | Yes | **Params:** `:id` of target user to unfollow.<br>**Returns:** `200 OK` `{ "message": "User unfollowed successfully" }`. |
| `GET` | `/api/v1/users/:id/followers`| **ListFollowers**| No | **Query:** `?page=1&limit=10`<br>**Returns:** `200 OK` with array of user objects who follow `:id`. |
| `GET` | `/api/v1/users/:id/following`| **ListFollowing**| No | **Query:** `?page=1&limit=10`<br>**Returns:** `200 OK` with array of user objects followed by `:id`. |
| `GET` | `/api/v1/users/:id/is-following`| **CheckFollow**| Yes | **Params:** `:id` of target user.<br>**Returns:** `200 OK` `{ "isFollowing": true }` or `false`. |

---

## 4. 📝 Tweets (`/api/v1/tweets`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/tweets` | **PostTweet** | Yes | **Body:** `{ "content": "Hello world! #coding", "mediaIds": ["id1", "id2"] }`<br>**Returns:** `201 Created` with created tweet object. |
| `GET` | `/api/v1/tweets/:id` | **GetTweet** | No | **Params:** `:id` of the tweet.<br>**Returns:** `200 OK` with tweet text, author info, timestamps, and media. |
| `PUT` | `/api/v1/tweets/:id` | **EditTweet** | Yes | **Body:** `{ "content": "Updated content here! #nodejs" }`<br>**Returns:** `200 OK` with updated tweet object (must be tweet owner). |
| `DELETE` | `/api/v1/tweets/:id` | **DeleteTweet** | Yes | **Params:** `:id` of tweet to delete.<br>**Returns:** `200 OK` `{ "message": "Tweet deleted successfully" }`. |
| `GET` | `/api/v1/tweets/user/:userId`| **UserTimeline**| No | **Query:** `?cursor=tweet_id&limit=10`<br>**Returns:** `200 OK` with array of user's tweets (cursor pagination). |

---

## 5. ❤️ Likes (`/api/v1/tweets`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/tweets/:id/like` | **Like** | Yes | **Params:** `:id` of tweet to like.<br>**Returns:** `201 Created` `{ "message": "Tweet liked successfully" }`. |
| `DELETE` | `/api/v1/tweets/:id/like` | **Unlike** | Yes | **Params:** `:id` of tweet to unlike.<br>**Returns:** `200 OK` `{ "message": "Tweet unliked successfully" }`. |
| `GET` | `/api/v1/tweets/:id/likes` | **ListLikes** | No | **Query:** `?page=1&limit=10`<br>**Returns:** `200 OK` with array of users who liked the tweet. |
| `GET` | `/api/v1/tweets/:id/like-count`| **CountLikes** | No | **Params:** `:id` of tweet.<br>**Returns:** `200 OK` `{ "data": { "likes": 42 } }`. |
| `GET` | `/api/v1/tweets/:id/is-liked` | **CheckLike** | Yes | **Params:** `:id` of tweet.<br>**Returns:** `200 OK` `{ "data": { "isLiked": true } }`. |

---

## 6. 🔁 Retweets (`/api/v1/tweets`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/tweets/:id/retweet` | **Retweet** | Yes | **Params:** `:id` of tweet to retweet.<br>**Returns:** `201 Created` `{ "message": "Tweet retweeted successfully" }`. |
| `DELETE` | `/api/v1/tweets/:id/retweet` | **UndoRetweet** | Yes | **Params:** `:id` of tweet.<br>**Returns:** `200 OK` `{ "message": "Retweet undone successfully" }`. |
| `GET` | `/api/v1/tweets/:id/retweets` | **ListRetweets**| No | **Query:** `?page=1&limit=10`<br>**Returns:** `200 OK` with array of users who retweeted. |
| `GET` | `/api/v1/tweets/:id/retweet-count`| **CountRetweets**| No | **Params:** `:id` of tweet.<br>**Returns:** `200 OK` `{ "data": { "retweets": 15 } }`. |
| `GET` | `/api/v1/tweets/:id/is-retweeted`| **CheckRetweet**| Yes | **Params:** `:id` of tweet.<br>**Returns:** `200 OK` `{ "data": { "isRetweeted": true } }`. |

---

## 7. 💬 Comments (`/api/v1`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/tweets/:id/comments` | **Comment** | Yes | **Body:** `{ "content": "Great tweet!" }`<br>**Returns:** `201 Created` with created comment object. |
| `GET` | `/api/v1/tweets/:id/comments` | **ListComments**| No | **Query:** `?page=1&limit=10`<br>**Returns:** `200 OK` with array of comments for tweet `:id`. |
| `PUT` | `/api/v1/comments/:id` | **EditComment** | Yes | **Body:** `{ "content": "Updated reply text!" }`<br>**Returns:** `200 OK` with updated comment (must be owner). |
| `DELETE` | `/api/v1/comments/:id` | **DeleteComment**| Yes | **Params:** `:id` of comment.<br>**Returns:** `200 OK` `{ "message": "Comment deleted successfully" }`. |

---

## 8. 📰 Home Timeline Feed (`/api/v1/feed`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/feed/home` | **HomeFeed** | Yes | **Query:** `?cursor=last_seen_id&limit=20`<br>**Returns:** `200 OK` with tweets from followed users + own tweets, ordered chronologically. |

---

## 9. 🔍 Search (`/api/v1/search`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/search/tweets` | **SearchTweets**| No | **Query:** `?q=system+design&page=1&limit=10`<br>**Returns:** `200 OK` with tweets matching keyword in content. |
| `GET` | `/api/v1/search/users` | **SearchUsers** | No | **Query:** `?q=alice&page=1&limit=10`<br>**Returns:** `200 OK` with user profiles matching username/email. |

---

## 10. 🔔 Notifications (`/api/v1/notifications`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/notifications` | **ListAlerts** | Yes | **Query:** `?page=1&limit=20`<br>**Returns:** `200 OK` with array of alerts (LIKE, COMMENT, FOLLOW, RETWEET) with actor and tweet details. |
| `PATCH`| `/api/v1/notifications/:id/read`| **MarkRead** | Yes | **Params:** `:id` of notification.<br>**Returns:** `200 OK` `{ "success": true, "message": "Notification marked as read" }`. |
| `PATCH`| `/api/v1/notifications/read-all`| **MarkAllRead** | Yes | **Returns:** `200 OK` `{ "success": true, "message": "All notifications marked as read" }`. |
| `DELETE`| `/api/v1/notifications/:id` | **DeleteAlert** | Yes | **Params:** `:id` of notification.<br>**Returns:** `200 OK` `{ "success": true, "message": "Notification deleted successfully" }`. |

---

## 11. 🖼️ Media Upload (`/api/v1/media`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/media/upload` | **UploadMedia** | Yes | **Header:** `Content-Type: multipart/form-data`<br>**Body:** Form data field named `file` (image or video max 5MB).<br>**Returns:** `201 Created` with `{ "url": "https://res.cloudinary.com/...", "publicId": "...", "type": "IMAGE" }`. |

---

## 12. #️⃣ Hashtags (`/api/v1/hashtags`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/hashtags/trending`| **Trending** | No | **Query:** `?limit=10`<br>**Returns:** `200 OK` with array of top tags: `[{ "name": "nodejs", "count": 120 }, ...]`. |
| `GET` | `/api/v1/hashtags` | **Autocomplete**| No | **Query:** `?q=nod&limit=10`<br>**Returns:** `200 OK` with matching tag suggestions: `[{ "id": "...", "name": "nodejs" }]`. |
| `GET` | `/api/v1/hashtags/:name` | **TaggedTweets**| No | **Params:** `:name` (e.g. `/api/v1/hashtags/nodejs` or `/api/v1/hashtags/%23nodejs`).<br>**Query:** `?page=1&limit=10`<br>**Returns:** `200 OK` with array of tweets containing that hashtag. |

---

## 🩺 System Health (`/health`)

| Method | Endpoint | Functionality (1 Word) | Auth | How to Use (Request / Response) |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/health` | **HealthCheck** | No | **Returns:** `200 OK` `{ "success": true, "message": "Server is healthy" }`. |
