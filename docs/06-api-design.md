# Chapter 6. API Design & REST Specifications

> **Objective**: Define clean, RESTful HTTP contracts, establish standard URL naming conventions, define exact JSON Request/Response Data Transfer Object (DTO) schemas, specify appropriate HTTP status codes, and detail our cursor-based pagination architecture.

---

## 6.1 RESTful API Design Principles

Our API layer strictly adheres to Level 2 of the Richardson Maturity Model for RESTful web services:
1.  **Resource-Oriented URLs**: Endpoints represent domain nouns (`/users`, `/tweets`), never action verbs (`/createTweet`, `/getUsers`).
2.  **HTTP Method Semantics**:
    *   `GET`: Retrieve resources (Idempotent, safe, cacheable).
    *   `POST`: Create new resources or execute non-idempotent actions.
    *   `PATCH`: Partially update existing resource attributes.
    *   `DELETE`: Remove resources.
3.  **API Versioning**: All endpoints are prefixed with `/api/v1/` to ensure backwards compatibility when introducing future breaking schema changes.

---

## 6.2 Standard HTTP Status Code Mapping

Every API response returns an appropriate HTTP status code clearly communicating the execution result:

| Status Code | Name | Usage Scenario in Twitter Backend |
| :--- | :--- | :--- |
| **`200 OK`** | OK | Successful `GET` retrieval, login, or profile modification. |
| **`201 Created`**| Created | Successful creation of a Tweet, Account, or Comment. |
| **`204 No Content`**| No Content| Successful deletion of a Tweet or Unfollowing an account. |
| **`400 Bad Request`**| Bad Request| Zod schema validation failure (e.g., tweet content $> 280$ chars). |
| **`401 Unauthorized`**| Unauthorized| Missing, expired, or invalid JWT Bearer Authorization header. |
| **`403 Forbidden`** | Forbidden | User attempting to delete a tweet authored by someone else. |
| **`404 Not Found`** | Not Found | Requested Tweet ID or Username does not exist in database. |
| **`409 Conflict`** | Conflict | User attempting to sign up with an already registered email/username. |
| **`500 Internal Error`**| Server Error| Unhandled database exception or infrastructure failure. |

---

## 6.3 Standard JSON Response Wrapper

To provide a predictable contract for frontend and mobile clients, all API responses (success or failure) are wrapped in a standardized JSON envelope:

### Success Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-07-26T15:30:00.000Z",
    "pagination": {
      "nextCursor": "2026-07-26T14:22:10.123Z",
      "limit": 20
    }
  }
}
```

### Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tweet content cannot exceed 280 characters.",
    "details": [
      {
        "field": "content",
        "issue": "String must contain at most 280 character(s)"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-26T15:30:00.000Z",
    "path": "/api/v1/tweets"
  }
}
```

---

## 6.4 Core API Endpoint Specifications

### 1. Authentication Endpoints

#### `POST /api/v1/auth/signup`
Creates a new user account and returns JWT credentials.
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "username": "sireesh_dev",
      "email": "sireesh@gmail.com",
      "password": "SecurePassword123!"
    }
    ```
*   **Response (`201 Created`)**:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "710b962e-041c-11e1-9234-0123456789ab",
          "username": "sireesh_dev",
          "email": "sireesh@gmail.com"
        },
        "tokens": {
          "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
        }
      }
    }
    ```

#### `POST /api/v1/auth/login`
Authenticates existing user credentials.
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "email": "sireesh@gmail.com",
      "password": "SecurePassword123!"
    }
    ```
*   **Response (`200 OK`)**: Returns identical token DTO payload as signup.

---

### 2. Tweet Endpoints

#### `POST /api/v1/tweets`
Publishes a new tweet with optional media attachments.
*   **Access**: Protected (Requires `Authorization: Bearer <token>`)
*   **Request Body**:
    ```json
    {
      "content": "Designing a scalable Twitter backend from scratch using Node.js, TypeScript, PostgreSQL, and Kafka! 🚀 #SystemDesign",
      "mediaUrls": [
        "https://s3.amazonaws.com/twitter-media/img_101.jpg"
      ]
    }
    ```
*   **Response (`201 Created`)**:
    ```json
    {
      "success": true,
      "data": {
        "id": "991c262e-041c-11e1-9234-0123456789cc",
        "userId": "710b962e-041c-11e1-9234-0123456789ab",
        "content": "Designing a scalable Twitter backend from scratch using Node.js, TypeScript, PostgreSQL, and Kafka! 🚀 #SystemDesign",
        "likesCount": 0,
        "commentsCount": 0,
        "media": [
          {
            "id": "111c262e-041c-11e1-9234-0123456789dd",
            "url": "https://s3.amazonaws.com/twitter-media/img_101.jpg"
          }
        ],
        "createdAt": "2026-07-26T15:35:00.000Z"
      }
    }
    ```

#### `DELETE /api/v1/tweets/:id`
Deletes a published tweet. Enforces ownership check (only the author can delete).
*   **Access**: Protected (Bearer JWT)
*   **Response (`204 No Content`)**: Empty response body.

---

### 3. Social & Follow Endpoints

#### `POST /api/v1/users/:targetUserId/follow`
Subscribes the authenticated user to the target user account.
*   **Access**: Protected (Bearer JWT)
*   **Response (`200 OK`)**:
    ```json
    {
      "success": true,
      "data": {
        "followerId": "710b962e-041c-11e1-9234-0123456789ab",
        "followingId": "882c262e-041c-11e1-9234-0123456789ff",
        "status": "FOLLOWED"
      }
    }
    ```

---

## 6.5 Pagination Architecture: Why Cursor > Offset

When retrieving timelines (`GET /api/v1/feed/home`), beginners almost always use traditional **Offset-based Pagination**:
```sql
-- BAD: Traditional Offset Pagination
SELECT * FROM tweets ORDER BY created_at DESC LIMIT 20 OFFSET 10000;
```

### Why Offset Pagination Fails at Scale
1.  **Catastrophic Database Performance**: To execute `OFFSET 10000 LIMIT 20`, PostgreSQL must read, sort, and count 10,020 rows from disk, only to discard the first 10,000! As the user scrolls deeper into a timeline, query latency grows linearly from $5\text{ms}$ to $500\text{ms}+$.
2.  **Duplicate or Missed Tweets (The Real-Time Drift Problem)**: While a user is reading Page 1, 5 new tweets are published at the top of the feed. When the user requests Page 2 (`OFFSET 20`), the entire database dataset has shifted down by 5 rows. The user will see 5 duplicate tweets from Page 1!

### The Solution: Cursor-Based Pagination
Instead of counting row offsets, we pass a pointer (**Cursor**) representing the timestamp or ID of the very last item seen on the previous page:

#### Cursor API Request
```http
GET /api/v1/feed/home?limit=20&cursor=2026-07-26T15:20:00.000Z
```

#### Underlying Optimized SQL Query
```sql
-- GOOD: Cursor Pagination using Index Lookup
SELECT * FROM tweets 
WHERE created_at < '2026-07-26T15:20:00.000Z' 
ORDER BY created_at DESC 
LIMIT 20;
```

> 💡 **Architectural Takeaway**: Because `created_at` is indexed via our composite B-Tree index, PostgreSQL jumps directly to index node `2026-07-26T15:20:00.000Z` and scans exactly 20 leaf nodes. **Query execution remains a constant $\approx 2\text{ms}$ regardless of whether fetching page 1 or page 1,000**, with zero risk of duplicate items during real-time feed updates!
