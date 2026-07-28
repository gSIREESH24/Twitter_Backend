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

```text
     [ 📱 User Phone / Web App ]
                 │
                 │ (1. HTTPS Request: "Create Tweet")
                 ▼
     [ ⚖️ Nginx Load Balancer ]    ──► Distributes traffic so no single server gets overloaded.
                 │
                 ▼
       [ 🌐 Express API Gateway ]  ──► Checks: "Is this user logged in? Is the data valid?"
                 │                   (Exposes /metrics for Prometheus)
                 ▼
    ┌─────────────────────────┐
    │  Modular Monolith Core  │    ──► The Brain: Handles Users, Tweets, Feeds, and Follows.
    └────┬───────────┬────────┘
         │           │
         │           └──────────────────────────────┐
         ▼                                          ▼
 [ 🐘 PostgreSQL DB ]                       [ ⚡ Redis Cache ]
  Stores permanent data                      Stores hot home feeds & rate limits
  (Users, Tweets, Likes)                     for instant (<5ms) loading.
         │
         │ (2. Background Event: "Tweet Created")
         ▼
 [ 📬 Apache Kafka Bus ]   ──► Asynchronously tells background workers to push notifications
                               and update followers' timelines without slowing down the app!
                               
──────────────────────────────────────────────────────────────────────────────────────────
 [ 📊 Observability Stack ] ──► Prometheus scrapes metrics from the API and Databases.
                                Grafana visualizes the data for real-time monitoring!
```

---

## 🐳 Running with Docker

We have fully containerized the entire infrastructure (PostgreSQL, Redis, Apache Kafka, and the Node.js API). You can spin up the entire backend with a single command!

**1. Start the entire stack (in the background):**
```bash
docker compose up --build -d
```

**2. View the real-time API logs:**
```bash
docker logs -f twitter_api
```

**3. Stop and tear down the stack:**
```bash
docker compose down
```

*(Note: Docker automatically manages persistent volumes, so your database and Kafka events will survive restarts!)*

---

## 📚 System Design & Architecture Documentation

We have organized the entire system design, architecture principles, requirements, and database schemas into **5 comprehensive, easy-to-read documentation guides**:

| Doc # | Guide Title | What You Will Learn |
| :--- | :--- | :--- |
| **01** | [**System Design Principles Used Till Now**](./docs/01-system-design-principles-used.md) | Details on our Modular Monolith architecture, 4-tier Layered Design (Routes -> Controller -> Service -> Repository), idempotency via composite keys, DRY, and cursor vs. offset pagination. |
| **02** | [**Functional & Non-Functional Requirements**](./docs/02-functional-and-non-functional-requirements.md) | The complete breakdown of all 11 functional feature modules and NFR targets (p95 latency <100ms, 99.99% availability, hybrid consistency models, and security hardening). |
| **03** | [**Database Schema, Relations & ER Diagrams**](./docs/03-database-schema-relations-and-diagrams.md) | In-depth ER explanations, Mermaid relational diagrams, 1:M and M:N junction table breakdowns, and the full production Prisma schema implementation. |
| **04** | [**Complete API Reference & Usage Guide**](./docs/04-api-reference-and-usage.md) | Full listing of all REST API endpoints, concise 1-word functionality descriptions, auth requirements, and practical usage examples (request body, params, query, response). |
| **05** | [**Redis Architecture**](./docs/05-redis-architecture.md) | Details on how Redis is used for caching and rate limiting. |
| **06** | [**Kafka Event Streaming**](./docs/06-kafka-event-streaming.md) | Details on Kafka setup and usage for event-driven architecture. |
| **07** | [**Monitoring & Observability**](./docs/07-monitoring-observability.md) | Details on the Phase 2 monitoring stack including Prometheus, Grafana, Node.js API instrumentation, cAdvisor, and exporters. |
| **08** | [**Master Architecture Portfolio**](./docs/08-master-architecture-portfolio.md) | The ultimate master document chronicling the entire engineering journey, complete with end-to-end architecture diagrams, NFR optimizations, and data relation diagrams. |

---

## 💡 Why Our Design Works

1. **Simple to Understand**: Built with clean, feature-based folders (`/user`, `/tweet`, `/feed`, `/retweet`, `/hashtag`) so everything related to a feature stays together.
2. **Fast & Reliable**: Engineered for low-latency execution with B-tree indexed lookups and stateless JWT auth.
3. **Easy to Scale**: Our API servers are **stateless** (they don't store local session data), meaning we can add 10 or 100 new server instances anytime traffic spikes!

---

## 🚀 What's Next?

Start by reading [**01: System Design Principles Used Till Now**](./docs/01-system-design-principles-used.md) to understand how the current backend is architected, then explore the database schemas and future scaling blueprints in the `docs/` folder!
