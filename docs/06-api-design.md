# Chapter 6. API Design & REST Specifications

> **How do mobile apps talk to our server?** A high-level guide to RESTful URL naming, HTTP status codes, clean JSON responses, and why **Cursor Pagination** makes scrolling infinitely smoother!

---

## 1. What is a RESTful API?

When your mobile phone app wants to load tweets or publish a post, it sends an HTTP message over the internet to our backend. We design these endpoints using **RESTful Principles**:

1. **Use Nouns, Not Verbs**: URLs represent resources (`/users`, `/tweets`), not actions (`/createTweet` is bad!).
2. **Use Standard HTTP Methods**:
   - `GET`: Fetch data (Safe, read-only).
   - `POST`: Create new data (Publishing a tweet or logging in).
   - `DELETE`: Remove data (Unfollowing or deleting a post).
3. **API Versioning**: All URLs start with `/api/v1/` so we can upgrade our features later without breaking older mobile app versions!

---

## 2. Standard HTTP Status Codes (The Server's Reply)

Every time our server replies to an app, it attaches a 3-digit number telling the app exactly what happened:

|      Status Code       | Meaning              | When Do We Use It?                                                   |
| :--------------------: | :------------------- | :------------------------------------------------------------------- |
|      **`200 OK`**      | Success              | You successfully fetched a profile or logged in.                     |
|   **`201 Created`**    | Successfully Created | You successfully published a new tweet or signed up!                 |
|  **`204 No Content`**  | Successfully Deleted | You deleted a tweet or unfollowed an account.                        |
| **`400 Bad Request`**  | Invalid Input        | Your tweet was over 280 characters or your email was malformed.      |
| **`401 Unauthorized`** | Login Required       | You tried to post a tweet without a valid login badge (JWT).         |
|  **`403 Forbidden`**   | Permission Denied    | You tried to delete a tweet that belongs to someone else!            |
|  **`404 Not Found`**   | Doesn't Exist        | You searched for a username or tweet ID that is not in our database. |

---

## 3. Clean JSON Response Examples

To make life easy for frontend and mobile app developers, every response from our server comes wrapped in a clean, predictable JSON package.

### ✅ Successful Response Example (Posting a Tweet)

When you publish a tweet at `POST /api/v1/tweets`, the server replies:

```json
{
  "success": true,
  "data": {
    "id": "991c262e-041c-11e1-9234-0123456789cc",
    "content": "Designing a scalable Twitter backend from scratch! 🚀 #SystemDesign",
    "likesCount": 0,
    "commentsCount": 0,
    "author": {
      "username": "sireesh_dev",
      "avatarUrl": "https://s3.amazonaws.com/twitter-media/avatar.jpg"
    },
    "createdAt": "2026-07-26T15:35:00Z"
  }
}
```

### ❌ Error Response Example (Tweet Too Long)

If your tweet exceeds 280 characters, the server politely rejects it:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tweet content cannot exceed 280 characters."
  }
}
```

---

## 4. Why Cursor Pagination is Better Than Page Numbers

When you scroll through a Twitter feed, we cannot send you all 5 million tweets at once—your phone would crash! Instead, we send tweets in chunks of 20. This is called **Pagination**.

### ❌ The Old Way: Offset Pagination (Page Numbers)

In old websites, you see buttons for `Page 1`, `Page 2`, `Page 3`. Behind the scenes, the server tells the database: _"Skip the first 10,000 tweets and grab the next 20"_ (`OFFSET 10000 LIMIT 20`).

**Why this fails for social media**:

1. **Slow Performance**: To skip 10,000 tweets, the database has to read all 10,000 from disk and throw them away! As you scroll deeper, loading gets slower and slower.
2. **Duplicate Tweets**: While you are reading Page 1, 5 new tweets are posted at the top of the timeline. When you scroll down to Page 2, everything has shifted down by 5 spots—meaning **you will see 5 duplicate tweets from Page 1!**

---

### ✅ The Modern Way: Cursor-Based Pagination (Timestamps)

Instead of counting page numbers, we give your phone a bookmark called a **Cursor** (usually the exact timestamp of the very last tweet on your screen).

When you scroll to the bottom, your app asks:

> _"Hey server, give me 20 tweets that were created **older than** `2026-07-26 15:20:00`!"_

**Why Cursor Pagination is awesome**:

1. **Instant Speed**: Because our timestamps are indexed, the database jumps directly to that exact second and grabs 20 tweets in **2 milliseconds**—whether you are on scroll 1 or scroll 1,000!
2. **Zero Duplicates**: Even if 100 new tweets arrive at the top of the feed while you are scrolling, your bookmark stays fixed to your timestamp, so your timeline scroll remains super smooth and glitch-free!
