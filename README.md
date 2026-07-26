# 🐦 Twitter Backend – High-Level System Design & Architecture

> **A clean, easy-to-understand architecture guide for building a scalable Twitter-like backend from scratch.**

---

## 🎯 What is this Project?

Most backend tutorials jump straight into writing code without explaining **why** things are built a certain way.

Professional software engineers don't do that. They first create a **High-Level Blueprint (System Design)** so everyone on the team understands:

- How millions of users will connect to the server without crashing it.
- How databases, caches, and message queues work together.
- Where code belongs so the project stays clean and easy to maintain.

Think of this documentation as the **blueprint for constructing a skyscraper**. We design the foundation, the plumbing, and the electrical grids before pouring the first drop of concrete!

---

## 🏛️ The High-Level Architecture (At a Glance)

How does a request travel from a user's phone to our database? Here is the simple end-to-end journey:

```
    [ 📱 User Phone / Web App ]
                 │
                 │ (1. HTTPS Request: "Create Tweet")
                 ▼
     [ ⚖️ Nginx Load Balancer ]    ──► Distributes traffic so no single server gets overloaded.
                 │
                 ▼
       [ 🌐 Express API Gateway ]  ──► Checks: "Is this user logged in? Is the data valid?"
                 │
                 ▼
    ┌─────────────────────────┐
    │  Modular Monolith Core  │    ──► The Brain: Handles Users, Tweets, Feeds, and Follows.
    └────┬───────────┬────────┘
         │           │
         │           └──────────────────────────────┐
         ▼                                          ▼
 [ 🐘 PostgreSQL DB ]                       [ ⚡ Redis Cache ]
  Stores permanent data                      Stores hot home feeds & sessions
  (Users, Tweets, Likes)                     for instant (<5ms) loading.
         │
         │ (2. Background Event: "Tweet Created")
         ▼
 [ 📬 Apache Kafka Bus ]   ──► Asynchronously tells background workers to push notifications
                               and update followers' timelines without slowing down the app!
```

---

## 📚 Easy-to-Read Documentation Guides

We have broken down the entire system design into **9 simple, bite-sized chapters**. No confusing jargon, no massive code dumps—just clear concepts, diagrams, and best practices!

| Chapter | Guide Title                                                                  | What You Will Learn                                                                                         |
| :------ | :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| **00**  | [**Master System Blueprint**](./SYSTEM_DESIGN.md)                            | A complete overview of the system architecture, data flow, and layers.                                      |
| **01**  | [**Problem Statement & Scope**](./docs/01-problem-statement-and-scope.md)    | What features we are building (Tweets, Feeds, Follows, Likes) and what we leave out for later.              |
| **02**  | [**Requirements & Scale Math**](./docs/02-requirement-analysis-and-scale.md) | How to calculate traffic, database storage, and memory needed for 1 Million Daily Active Users.             |
| **03**  | [**High-Level Architecture (HLA)**](./docs/03-high-level-architecture.md)    | How Load Balancers, Express Servers, PostgreSQL, Redis, and Kafka work together.                            |
| **04**  | [**Domain Modeling**](./docs/04-domain-modeling.md)                          | How the core entities (`User`, `Tweet`, `Follow`, `Like`, `Comment`, `Notification`) relate to each other.  |
| **05**  | [**Database Design**](./docs/05-database-design.md)                          | High-level table structures, why we index columns, and how we count likes without slowing down the DB.      |
| **06**  | [**API Design & REST Specs**](./docs/06-api-design.md)                       | How to name API endpoints cleanly and why **Cursor Pagination** is better than Offset Pagination for feeds. |
| **07**  | [**Software Layers (LLD)**](./docs/07-low-level-design.md)                   | Why we separate code into `Router -> Controller -> Service -> Repository` so every layer has ONE job.       |
| **08**  | [**Authentication System**](./docs/08-authentication-system.md)              | How secure login works using hashed passwords, short-lived Access Tokens, and secure Refresh Tokens.        |
| **09**  | [**Development Roadmap**](./docs/09-development-and-scaling-strategy.md)     | Our step-by-step plan: start simple as a clean monolith, add Redis/Kafka, and scale to microservices later. |

---

## 💡 Why Our Design Works

1. **Simple to Understand**: Built with clean, feature-based folders (`/user`, `/tweet`, `/feed`) so everything related to a feature stays together.
2. **Fast & Reliable**: By caching feeds in **Redis** and sending heavy background tasks to **Kafka**, our API responds in less than 50 milliseconds!
3. **Easy to Scale**: Our API servers are **stateless** (they don't store local session data), meaning we can add 10 or 100 new server instances anytime traffic spikes!

---

## 🚀 What's Next?

Start by reading the [**Master System Blueprint (`SYSTEM_DESIGN.md`)**](./SYSTEM_DESIGN.md) to see the big picture, then explore the individual chapters in the `docs/` folder!
