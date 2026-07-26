# Chapter 7. Low-Level Design (LLD)

> **Objective**: Convert our high-level architecture into a clean, testable software blueprint. We establish a strict Layered Architecture, organize code by feature domain, enforce SOLID principles using TypeScript interfaces and Dependency Injection, and implement centralized cross-cutting utilities (logging, configuration, and global error handling).

---

## 7.1 Layered Architecture Blueprint

To prevent code entanglement and maintainability nightmares, every HTTP request traverses 4 distinct software layers. Each layer has **one single responsibility**:

```
[ Incoming HTTP Request ]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 1. Express Router                                      │
│    └─► Maps URL path & HTTP method to Controller       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Controller Layer                                    │
│    └─► Extracts HTTP body/params, invokes Service,     │
│        and formats HTTP response status/JSON envelope  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Service Layer                                       │
│    └─► Executes pure business logic, domain validation,│
│        and orchestrates multiple repositories/events   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Repository Layer                                    │
│    └─► Executes parameterized SQL queries against DB   │
└────────────────────────────────────────────────────────┘
```

### Layer Rules & Boundaries
*   **The Controller MUST NOT**: Write SQL queries, hash passwords, talk directly to Redis/Kafka, or contain `if/else` business rules.
*   **The Service MUST NOT**: Import Express types (`req`, `res`), know about HTTP header formats, or write raw SQL strings.
*   **The Repository MUST NOT**: Contain business logic (e.g., checking if a user is banned before inserting a tweet). It simply performs CRUD operations.

---

## 7.2 Feature-Based Project Structure

Instead of grouping files by technical type (`/all-controllers/`, `/all-services/`), we organize our codebase by **Feature Domain**. This ensures high cohesion and allows any feature folder to be extracted into an independent microservice later without untangling imports:

```
twitter-backend/
├── src/
│   ├── config/              # Infrastructure setup
│   │   ├── database.ts      # PostgreSQL connection pool
│   │   ├── redis.ts         # Redis client configuration
│   │   └── kafka.ts         # Kafka broker configuration
│   │
│   ├── common/              # Shared cross-cutting components
│   │   ├── logger/
│   │   │   └── logger.ts    # Winston structured JSON logger
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── errors/
│   │   │   └── AppError.ts  # Custom domain error hierarchy
│   │   └── utils/
│   │       └── response.ts  # Standard JSON wrapper utility
│   │
│   ├── modules/             # Domain Feature Modules
│   │   ├── user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.model.ts
│   │   │   └── user.dto.ts
│   │   │
│   │   ├── tweet/
│   │   │   ├── tweet.controller.ts
│   │   │   ├── tweet.service.ts
│   │   │   ├── tweet.repository.ts
│   │   │   ├── tweet.routes.ts
│   │   │   ├── tweet.model.ts
│   │   │   └── tweet.dto.ts
│   │   │
│   │   ├── follow/
│   │   ├── comment/
│   │   └── notification/
│   │
│   ├── app.ts               # Express initialization & global middleware
│   └── server.ts            # Entry point: DB binding & HTTP server start
│
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 7.3 SOLID Principles in Backend Implementation

We enforce the 5 SOLID principles across our TypeScript codebase from Day 1:

### 1. Single Responsibility Principle (SRP)
*   **Bad**: A single `UserService` class handling user registration, password hashing, sending welcome emails, and formatting profile pictures.
*   **Good**: We separate these into dedicated classes: `AuthService` (identity), `UserService` (profile rules), `EmailService` (notifications), and `MediaService` (S3 uploads).

### 2. Open/Closed Principle (OCP)
Software entities should be open for extension, but closed for modification. If we add a new notification type (e.g., `MENTION_NOTIFICATION`), we do not rewrite existing notification sending logic; we implement a new handler extending the base `NotificationProvider` interface.

### 3. Liskov Substitution Principle (LSP)
Services depend on repository interfaces, not concrete database implementations. If we swap our relational `TweetRepository` from PostgreSQL to an in-memory mock during unit testing, the `TweetService` continues executing without a single line of code modified.

### 4. Interface Segregation Principle (ISP)
Instead of creating a massive `IDatabaseRepository` containing 50 methods for users, tweets, and comments, we create small, focused interfaces:
```typescript
export interface ITweetRepository {
  create(tweet: CreateTweetDTO): Promise<Tweet>;
  findById(id: string): Promise<Tweet | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
```

### 5. Dependency Inversion Principle (DIP)
High-level modules (Services) must not instantiate low-level modules (Repositories) directly using `new PostgresTweetRepository()`. Instead, repositories are **injected via constructor arguments**:
```typescript
export class TweetService {
  // DIP: Service depends on the abstraction (interface), not the concrete class
  constructor(
    private readonly tweetRepo: ITweetRepository,
    private readonly eventBus: IEventPublisher
  ) {}

  async createTweet(userId: string, content: string): Promise<Tweet> {
    const tweet = await this.tweetRepo.create({ userId, content });
    await this.eventBus.publish('TWEET_CREATED', { tweetId: tweet.id, userId });
    return tweet;
  }
}
```

---

## 7.4 Centralized Error Handling

### The Problem with Decentralized Try/Catch
In amateur codebases, every single route handler wraps execution in repeated `try/catch` blocks:
```typescript
// BAD: Repeated 200 times across controllers
app.get('/tweets/:id', async (req, res) => {
  try {
    const tweet = await tweetService.get(req.params.id);
    res.status(200).json(tweet);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});
```

### The Centralized Solution: `AppError` & Global Exception Middleware
We create a custom domain error hierarchy and a single global error handler middleware. Controllers never use `try/catch`; async errors are caught automatically by an async wrapper and forwarded to the global handler:

#### Custom AppError Class
```typescript
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error subclasses
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(404, `${resource} not found`);
  }
}
```

#### Global Error Handler Middleware
```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/logger';
import { AppError } from '../errors/AppError';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn(`[Operational Error] ${err.statusCode} - ${err.message}`, { path: req.path });
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.constructor.name, message: err.message }
    });
    return;
  }

  // Unhandled Programmer/Infrastructure Errors (500)
  logger.error(`[Unhandled Exception] ${err.message}`, { stack: err.stack, path: req.path });
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected internal error occurred." }
  });
};
```

---

## 7.5 Cross-Cutting Infrastructure Components

### 1. Configuration Management (`src/config/`)
We never hardcode secrets or magic strings. We use `dotenv` paired with **Zod schema validation** at server startup. If a required environment variable (e.g., `DATABASE_URL`, `JWT_SECRET`) is missing or malformed, the server refuses to boot, preventing runtime failures.

### 2. Structured Logging (Winston Logger)
We strictly forbid `console.log()`. We utilize **Winston** to output structured JSON logs containing timestamp, correlation ID, severity level, HTTP method, and latency. In production, these JSON logs are ingested seamlessly by Datadog or AWS CloudWatch.

### 3. Service Health Check Endpoint (`GET /health`)
Every compute instance exposes an unauthenticated `/health` probe endpoint for AWS ALB load balancers and Kubernetes readiness probes:
```json
{
  "status": "UP",
  "timestamp": "2026-07-26T15:40:00.000Z",
  "dependencies": {
    "database": "CONNECTED",
    "redis": "CONNECTED"
  }
}
```
