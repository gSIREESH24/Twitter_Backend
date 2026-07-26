# 📐 System Design Master Blueprint

This document serves as the **Master Blueprint** for the Twitter Backend System. It summarizes the core architectural decisions, data models, API contracts, low-level design layers, and security mechanisms across Chapters 1 through 9.

---

## 1. Executive Summary

Our goal is to build a high-performance, scalable social media backend capable of handling **1 Million Daily Active Users (DAU)** and generating **5 Million new tweets per day** with low-latency home feed generation and real-time engagement tracking.

### Core Architectural Decisions
*   **Architecture Pattern**: Layered Modular Monolith (evolving to Microservices).
*   **Primary Database**: PostgreSQL (for strict schema, ACID compliance, and complex join capabilities).
*   **Caching Layer**: Redis (for hot feeds, user sessions, and rate limiting).
*   **Asynchronous Messaging**: Apache Kafka (for decoupling notification delivery, feed fan-out, and analytics).
*   **Authentication**: Stateless JWT Access Tokens (15-minute expiry) paired with secure Refresh Tokens (30-day expiry).

---

## 2. Request Lifecycle Pipeline

Every incoming HTTP request traverses a strict, unidirectional pipeline. Each layer performs a single, well-defined responsibility:

```
[ Client Request ]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ 1. Express Router                                      │
│    └─► Identifies endpoint & routes to handler         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Authentication Middleware                           │
│    └─► Verifies JWT Bearer token & attaches req.user   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Validation Middleware                               │
│    └─► Validates DTOs (body, query, params) via Zod    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Controller Layer                                    │
│    └─► Extracts HTTP input & invokes Service           │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 5. Service Layer (Business Logic)                      │
│    └─► Executes domain rules & coordinates modules     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 6. Repository Layer                                    │
│    └─► Executes parameterized SQL against PostgreSQL   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
[ Formatted HTTP Response ]
```

---

## 3. High-Level Architecture Component Map

```mermaid
graph TD
    Client[Web / Mobile Clients] -->|HTTPS REST API| LB[Load Balancer / Nginx]
    LB --> API[API Gateway / Express Server]
    
    subgroup Auth & Middleware
        API --> AuthMW[JWT Auth Middleware]
        AuthMW --> ValMW[DTO Validation Middleware]
    end
    
    ValMW --> ModMono[Modular Monolith Core]
    
    subgraph Modular Monolith Core
        UserMod[User Module]
        TweetMod[Tweet Module]
        FeedMod[Feed Module]
        SocialMod[Follow / Social Module]
    end
    
    ModMono -->|Read/Write ACID| DB[(PostgreSQL Master)]
    ModMono -->|Read Replicas| DBRep[(PostgreSQL Replicas)]
    ModMono -->|Session / Feed Cache| Redis[(Redis Cluster)]
    ModMono -->|Publish Events| Kafka[Apache Kafka Brokers]
    
    subgraph Asynchronous Workers
        Kafka --> NotifSvc[Notification Worker]
        Kafka --> FeedWorker[Fan-out Feed Worker]
        Kafka --> AnalyticsSvc[Analytics Worker]
    end
    
    NotifSvc -->|Push/Email| Users[User Devices]
    FeedWorker -->|Update Timeline Cache| Redis
```

---

## 4. Domain & Data Relationship Overview

The core domain revolves around 7 primary entities. Below is the Entity Relationship summary:

| Entity | Primary Key | Critical Indexes | Relationships |
| :--- | :--- | :--- | :--- |
| **`users`** | `id` (UUID) | `email` (UNIQUE), `username` (UNIQUE) | Has many Tweets, Comments, Likes, Follows, Notifications. |
| **`tweets`** | `id` (UUID) | `(user_id, created_at DESC)` | Belongs to User; Has many Comments, Likes, Media. |
| **`follows`** | `(follower_id, following_id)` | `follower_id`, `following_id` | Many-to-Many mapping between Users. |
| **`likes`** | `(user_id, tweet_id)` | `user_id`, `tweet_id` | Many-to-Many mapping between Users and Tweets. |
| **`comments`** | `id` (UUID) | `tweet_id`, `user_id` | Belongs to User and Tweet. |
| **`notifications`** | `id` (UUID) | `(user_id, is_read, created_at DESC)` | Belongs to receiving User; references target entity. |
| **`media`** | `id` (UUID) | `tweet_id` | Belongs to Tweet. |

---

## 5. API Endpoint Summary Matrix

| Module | HTTP Method | Endpoint Path | Authentication | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/signup` | Public | Register new user account. |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | Authenticate user & return JWT tokens. |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Public | Renew expired Access Token via Refresh Token. |
| **User** | `GET` | `/api/v1/users/:username` | Optional | Retrieve public user profile. |
| **User** | `PATCH` | `/api/v1/users/me` | Bearer JWT | Update authenticated user profile. |
| **Tweet** | `POST` | `/api/v1/tweets` | Bearer JWT | Publish a new tweet. |
| **Tweet** | `GET` | `/api/v1/tweets/:id` | Optional | View single tweet with metadata. |
| **Tweet** | `DELETE` | `/api/v1/tweets/:id` | Bearer JWT (Owner)| Delete a published tweet. |
| **Feed** | `GET` | `/api/v1/feed/home` | Bearer JWT | Fetch personalized timeline (cursor paginated). |
| **Social** | `POST` | `/api/v1/users/:id/follow` | Bearer JWT | Follow a target user. |
| **Social** | `DELETE`| `/api/v1/users/:id/follow` | Bearer JWT | Unfollow a target user. |

---

## 6. Directory & Module Blueprint

We organize files **by feature (domain)** rather than by technical layer. This feature-based organization ensures cohesion and makes future extraction into microservices seamless:

```
src/
├── config/              # Centralized environment & infrastructure configs
│   ├── database.ts      # PostgreSQL connection pool setup
│   ├── redis.ts         # Redis client configuration
│   └── kafka.ts         # Kafka producer/consumer setup
├── common/              # Shared cross-cutting components
│   ├── logger/          # Structured logging utility (Winston)
│   ├── middleware/      # JWT auth, error handler, request logger
│   ├── errors/          # Custom AppError classes & HTTP status codes
│   └── utils/           # Helper functions (hashing, pagination formatting)
├── modules/             # Feature domain modules
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.routes.ts
│   │   └── user.dto.ts
│   ├── tweet/
│   │   ├── tweet.controller.ts
│   │   ├── tweet.service.ts
│   │   ├── tweet.repository.ts
│   │   ├── tweet.routes.ts
│   │   └── tweet.dto.ts
│   ├── follow/
│   ├── comment/
│   └── notification/
├── app.ts               # Express app setup, global middleware & routing
└── server.ts            # HTTP server startup, DB connections & graceful shutdown
```

---

## 7. Next Steps & Detailed Chapters

For comprehensive, chapter-by-chapter breakdowns of every architectural decision, refer to the documentation suite in the `docs/` folder:

1. [**01. Problem Statement & Scope**](./docs/01-problem-statement-and-scope.md)
2. [**02. Requirement Analysis & Scale Estimation**](./docs/02-requirement-analysis-and-scale.md)
3. [**03. High-Level Architecture**](./docs/03-high-level-architecture.md)
4. [**04. Domain Modeling**](./docs/04-domain-modeling.md)
5. [**05. Database Design & SQL Schema**](./docs/05-database-design.md)
6. [**06. API Design & REST Specifications**](./docs/06-api-design.md)
7. [**07. Low-Level Design (LLD)**](./docs/07-low-level-design.md)
8. [**08. Authentication & Security System**](./docs/08-authentication-system.md)
9. [**09. Development & Scaling Strategy**](./docs/09-development-and-scaling-strategy.md)
