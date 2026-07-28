# 🌐 Complete API Reference & Postman Testing Guide

This document is the verified, authoritative API reference for the Twitter Backend. Every route has been cross-checked directly against `src/app.ts` and the modular route definitions. It includes each endpoint's **1-Word Functionality** and step-by-step instructions on **How to Test in Postman**.

---

## 🧪 How to Use & Test in Postman (Step-by-Step)

Before testing individual APIs, follow this simple setup workflow in Postman to automate authentication and variable tracking:

### 1. Set Up Postman Environment Variables
In Postman, create a new **Environment** named `Twitter Local` and add these variables:
- `baseUrl`: `http://localhost:5000` (or whatever port your server runs on)
- `accessToken`: *(leave blank initially; populate after logging in)*
- `userId`: *(leave blank initially; populate after registering)*
- `tweetId`: *(leave blank initially; populate after posting a tweet)*

### 2. How to Authenticate Requests (Bearer Token)
For any endpoint marked **Auth: Yes** in the tables below:
1. Click the **Authorization** tab in your Postman request.
2. Set **Auth Type** to **Bearer Token**.
3. In the **Token** field, enter `{{accessToken}}`.
*(Postman will automatically inject `Authorization: Bearer <your_token>` into the request headers!)*

### 3. How to Send JSON Request Bodies (POST / PUT / PATCH)
For endpoints requiring data (like registering, logging in, or tweeting):
1. Click the **Body** tab in Postman.
2. Select **raw** and choose **JSON** from the right-hand dropdown.
3. Paste the required JSON payload (examples provided in tables below).

### 4. How to Upload Images in Postman (`POST /api/v1/media/tweet/:id/upload`)
Media upload uses `multipart/form-data` rather than JSON:
1. Click the **Body** tab and select **form-data**.
2. In the **Key** column, type `image`.
3. Hover over the right edge of the `image` box and change the type dropdown from **Text** to **File**.
4. In the **Value** column, click **Select Files** and pick a `.jpg`, `.png`, or `.mp4` file from your computer.

### 5. How to Test Query Parameters (Pagination & Search)
For endpoints supporting filters or pagination (e.g., Feeds, Search, Followers):
1. Click the **Params** tab in Postman.
2. Enter key-value pairs (e.g., Key: `limit`, Value: `10` or Key: `q`, Value: `nodejs`).

---

## 🚀 The Recommended Postman Testing Sequence

To verify the entire backend from scratch in Postman, run requests in this chronological order:
1. **Health Check:** `GET {{baseUrl}}/health` ➔ Verify `200 OK`.
2. **Register Account:** `POST {{baseUrl}}/api/v1/users/register` ➔ Copy the returned user `id` into `{{userId}}`.
3. **Login:** `POST {{baseUrl}}/api/v1/auth/login` ➔ Copy the returned `accessToken` into `{{accessToken}}`.
4. **Verify Session:** `GET {{baseUrl}}/api/v1/users/me` (with Bearer Token) ➔ Verify your profile returns.
5. **Create Tweet:** `POST {{baseUrl}}/api/v1/tweets` ➔ Copy the returned tweet `id` into `{{tweetId}}`.
6. **Upload Image:** `POST {{baseUrl}}/api/v1/media/tweet/{{tweetId}}/upload` (form-data with `image` file) ➔ Verify media attaches to tweet.
7. **Like & Comment:** Test `POST {{baseUrl}}/api/v1/tweets/{{tweetId}}/like` and comments.
8. **View Feed:** `GET {{baseUrl}}/api/v1/feed` ➔ See your tweet in the timeline!

---

## 📋 Verified API Endpoint Tables

### 🩺 1. System Health (`/health`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/health` | **HealthCheck** | No | **URL:** `{{baseUrl}}/health`<br>**Returns:** `200 OK` `{ "success": true, "message": "Server is healthy" }`. |

---

### 🔐 2. Authentication & Users (`/api/v1/auth` & `/api/v1/users`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/users/register`| **Register** | No | **Body (JSON):** `{ "email": "alice@test.com", "username": "alice", "password": "Password123!" }`<br>**Returns:** `201 Created` with user profile object. |
| `POST` | `/api/v1/auth/login` | **Login** | No | **Body (JSON):** `{ "email": "alice@test.com", "password": "Password123!" }`<br>**Returns:** `200 OK` `{ "accessToken": "eyJ..." }`. |
| `GET` | `/api/v1/users/me` | **Me** | Yes | **Header:** Bearer Token `{{accessToken}}`<br>**Returns:** `200 OK` with currently authenticated user profile and stats. |

---

### 🤝 3. Social Graph / Follow (`/api/v1/users`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/users/:id/follow` | **Follow** | Yes | **URL:** `{{baseUrl}}/api/v1/users/{{targetUserId}}/follow`<br>**Returns:** `200/201 OK` `{ "message": "User followed successfully" }`. |
| `DELETE` | `/api/v1/users/:id/follow` | **Unfollow** | Yes | **URL:** `{{baseUrl}}/api/v1/users/{{targetUserId}}/follow`<br>**Returns:** `200 OK` `{ "message": "User unfollowed successfully" }`. |
| `GET` | `/api/v1/users/:id/followers`| **Followers** | No | **URL:** `{{baseUrl}}/api/v1/users/{{targetUserId}}/followers?page=1&limit=10`<br>**Returns:** `200 OK` array of followers. |
| `GET` | `/api/v1/users/:id/following`| **Following** | No | **URL:** `{{baseUrl}}/api/v1/users/{{targetUserId}}/following?page=1&limit=10`<br>**Returns:** `200 OK` array of followed users. |
| `GET` | `/api/v1/users/:id/follow-stats`|**FollowStats**| No | **URL:** `{{baseUrl}}/api/v1/users/{{targetUserId}}/follow-stats`<br>**Returns:** `200 OK` follower/following numerical counts. |
| `GET` | `/api/v1/users/:id/is-following`|**CheckFollow**| Yes | **URL:** `{{baseUrl}}/api/v1/users/{{targetUserId}}/is-following`<br>**Returns:** `200 OK` `{ "isFollowing": true }` or `false`. |

---

### 📝 4. Tweets (`/api/v1/tweets`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/tweets` | **PostTweet** | Yes | **Body (JSON):** `{ "content": "Hello #NodeJS world!" }`<br>**Returns:** `201 Created` with created tweet object. |
| `GET` | `/api/v1/tweets/:id` | **GetTweet** | No | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}`<br>**Returns:** `200 OK` with tweet text, author info, and media. |
| `PUT` | `/api/v1/tweets/:id` | **EditTweet** | Yes | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}`<br>**Body (JSON):** `{ "content": "Updated text #redis" }`<br>**Returns:** `200 OK` updated tweet. |
| `DELETE` | `/api/v1/tweets/:id` | **DeleteTweet** | Yes | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}`<br>**Returns:** `200 OK` `{ "message": "Tweet deleted successfully" }`. |
| `GET` | `/api/v1/tweets/user/:id`| **UserTweets** | No | **URL:** `{{baseUrl}}/api/v1/tweets/user/{{targetUserId}}?limit=10`<br>**Returns:** `200 OK` array of user's tweets (cursor paginated). |

---

### ❤️ 5. Likes (`/api/v1/tweets`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/tweets/:id/like` | **Like** | Yes | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/like`<br>**Returns:** `201 Created` `{ "message": "Tweet liked" }`. |
| `DELETE` | `/api/v1/tweets/:id/like` | **Unlike** | Yes | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/like`<br>**Returns:** `200 OK` `{ "message": "Tweet unliked" }`. |
| `GET` | `/api/v1/tweets/:id/likes` | **ListLikes** | No | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/likes?page=1&limit=10`<br>**Returns:** `200 OK` array of users who liked. |
| `GET` | `/api/v1/tweets/:id/like-count`| **LikeCount** | No | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/like-count`<br>**Returns:** `200 OK` `{ "likeCount": 42 }`. |
| `GET` | `/api/v1/tweets/:id/is-liked` | **CheckLike** | Yes | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/is-liked`<br>**Returns:** `200 OK` `{ "isLiked": true }` or `false`. |

---

### 🔁 6. Retweets (`/api/v1/tweets`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/tweets/:id/retweet` | **Retweet** | Yes | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/retweet`<br>**Returns:** `201 Created` `{ "message": "Retweeted successfully" }`. |
| `DELETE` | `/api/v1/tweets/:id/retweet` | **UndoRetweet**| Yes | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/retweet`<br>**Returns:** `200 OK` `{ "message": "Retweet removed" }`. |
| `GET` | `/api/v1/tweets/:id/retweets` | **Retweets** | No | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/retweets?page=1&limit=10`<br>**Returns:** `200 OK` array of retweeting users. |
| `GET` | `/api/v1/tweets/:id/retweet-count`|**RetweetCount**|No | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/retweet-count`<br>**Returns:** `200 OK` `{ "retweetCount": 15 }`. |
| `GET` | `/api/v1/tweets/:id/is-retweeted`|**CheckRetweet**|Yes| **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/is-retweeted`<br>**Returns:** `200 OK` `{ "isRetweeted": true }`. |

---

### 📰 7. Timeline Feeds (`/api/v1/feed`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/feed/` | **HomeFeed** | Yes | **URL:** `{{baseUrl}}/api/v1/feed?limit=20`<br>**Returns:** `200 OK` personalized timeline of tweets from followed users + own tweets. |
| `GET` | `/api/v1/feed/discover` | **DiscoverFeed**| Yes | **URL:** `{{baseUrl}}/api/v1/feed/discover?limit=20`<br>**Returns:** `200 OK` discovery timeline of global tweets. |
| `GET` | `/api/v1/feed/trending` | **TrendingFeed**| Yes | **URL:** `{{baseUrl}}/api/v1/feed/trending?limit=20`<br>**Returns:** `200 OK` timeline ranked by engagement/likes. |
| `GET` | `/api/v1/feed/users/:id/feed`| **UserFeed** | Yes | **URL:** `{{baseUrl}}/api/v1/feed/users/{{targetUserId}}/feed`<br>**Returns:** `200 OK` feed specific to target user's network. |

---

### 💬 8. Comments (`/api/v1`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/tweets/:id/comments` | **PostComment**| Yes | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/comments`<br>**Body (JSON):** `{ "content": "Awesome reply!" }`<br>**Returns:** `201 Created`. |
| `GET` | `/api/v1/tweets/:id/comments` | **ListComments**| No | **URL:** `{{baseUrl}}/api/v1/tweets/{{tweetId}}/comments?page=1&limit=10`<br>**Returns:** `200 OK` array of comments for tweet. |
| `GET` | `/api/v1/comments/:id` | **GetComment** | No | **URL:** `{{baseUrl}}/api/v1/comments/{{commentId}}`<br>**Returns:** `200 OK` single comment details. |
| `PUT` | `/api/v1/comments/:id` | **EditComment**| Yes | **URL:** `{{baseUrl}}/api/v1/comments/{{commentId}}`<br>**Body (JSON):** `{ "content": "Updated reply!" }`<br>**Returns:** `200 OK`. |
| `DELETE` | `/api/v1/comments/:id` | **DeleteComment**|Yes| **URL:** `{{baseUrl}}/api/v1/comments/{{commentId}}`<br>**Returns:** `200 OK` `{ "message": "Comment deleted" }`. |

---

### 🔍 9. Search (`/api/v1/search`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/search/users` | **SearchUsers**| No | **URL:** `{{baseUrl}}/api/v1/search/users?q=alice&page=1&limit=10`<br>**Returns:** `200 OK` array of matching user profiles. |
| `GET` | `/api/v1/search/tweets` | **SearchTweets**| Yes| **URL:** `{{baseUrl}}/api/v1/search/tweets?q=system+design&page=1&limit=10`<br>**Returns:** `200 OK` array of matching tweets. |

---

### 🔔 10. Notifications (`/api/v1/notifications`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/notifications/` | **ListAlerts** | Yes | **URL:** `{{baseUrl}}/api/v1/notifications?page=1&limit=20`<br>**Returns:** `200 OK` array of activity notifications (LIKE, FOLLOW, etc.). |
| `PATCH`| `/api/v1/notifications/read-all`|**MarkAllRead**|Yes| **URL:** `{{baseUrl}}/api/v1/notifications/read-all`<br>**Returns:** `200 OK` `{ "success": true, "message": "Marked all as read" }`. |
| `PATCH`| `/api/v1/notifications/:id/read`| **MarkRead** | Yes | **URL:** `{{baseUrl}}/api/v1/notifications/{{notifId}}/read`<br>**Returns:** `200 OK` marked single notification read. |
| `DELETE`| `/api/v1/notifications/:id` | **DeleteAlert**| Yes | **URL:** `{{baseUrl}}/api/v1/notifications/{{notifId}}`<br>**Returns:** `200 OK` notification deleted. |

---

### 🖼️ 11. Media Upload (`/api/v1/media`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/v1/media/tweet/:id/upload`|**UploadImage**|Yes| **URL:** `{{baseUrl}}/api/v1/media/tweet/{{tweetId}}/upload`<br>**Body:** `form-data` with Key: `image` (Type: File), Value: select file.<br>**Returns:** `201 Created` with Cloudinary CDN URL and `publicId`. |

---

### #️⃣ 12. Hashtags (`/api/v1/hashtags`)
| Method | Endpoint | Functionality (1 Word) | Auth | How to Use in Postman |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/api/v1/hashtags/trending`| **TrendingTags**|No | **URL:** `{{baseUrl}}/api/v1/hashtags/trending?limit=10`<br>**Returns:** `200 OK` array of top hashtags ranked by tweet volume. |
| `GET` | `/api/v1/hashtags/` | **AllTags** | No | **URL:** `{{baseUrl}}/api/v1/hashtags?limit=20`<br>**Returns:** `200 OK` array of all registered hashtags. |
| `GET` | `/api/v1/hashtags/:name` | **TaggedTweets**|No | **URL:** `{{baseUrl}}/api/v1/hashtags/nodejs?page=1&limit=10`<br>**Returns:** `200 OK` array of tweets containing `#nodejs`. |
