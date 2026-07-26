# 🚀 Twitter Backend Architecture & System Design

> **A professional, enterprise-grade system design and software architecture blueprint for building a scalable Twitter-like backend service capable of supporting millions of daily active users.**

---

## 📌 Project Overview

Most backend tutorials jump directly from a basic idea to writing code without any architectural planning. This repository demonstrates the **professional software engineering lifecycle**: designing the requirements, high-level system architecture, database schema, API contracts, low-level software layers, and security systems **before** writing a single line of production code.

We follow an evolutionary development strategy: starting as a cleanly organized **Modular Monolith** with clear domain boundaries, and incrementally introducing caching (**Redis**), event streaming (**Kafka**), containerization (**Docker**), observability, and eventually decomposing into **Microservices** when scale demands it.

---

## 🏛️ Overall System Architecture

```
                                  +-------------------+
                                  |    Web / Mobile   |
                                  |      Clients      |
                                  +---------+---------+
                                            |
                                   HTTPS / REST API
                                            |
                                            v
                                  +-------------------+
                                  |   Load Balancer   |
                                  +---------+---------+
                                            |
                                            v
                                  +-------------------+
                                  |    API Gateway    |
                                  +---------+---------+
                                            |
                 +--------------------------+--------------------------+
                 | (Authentication & Validation Middleware Pipeline)   |
                 +--------------------------+--------------------------+
                                            |
                                            v
                              +---------------------------+
                              |   Modular Monolith Core   |
                              |  (Layered Architecture)   |
                              +-------------+-------------+
                                            |
            +-------------------------------+-------------------------------+
            |                               |                               |
            v                               v                               v
 +---------------------+         +---------------------+         +---------------------+
 |     PostgreSQL      |         |     Redis Cache     |         |     Kafka Cluster   |
 |  (Primary Database) |         | (Sessions & Feeds)  |         |  (Event Streaming)  |
 +---------------------+         +---------------------+         +----------+----------+
                                                                            |
                                                                  +---------+---------+
                                                                  |                   |
                                                                  v                   v
                                                      +-------------------+ +-------------------+
                                                      | Notification Svc  | | Analytics Workers |
                                                      +-------------------+ +-------------------+
```

---

## 📚 Documentation Index

Our system design documentation is organized into modular, sequential chapters. Each chapter builds upon the previous one without repetition:

| Chapter | Document | Description |
| :--- | :--- | :--- |
| **00** | [**Master System Design Blueprint**](./SYSTEM_DESIGN.md) | The executive summary and master reference tying together all architectural layers. |
| **01** | [**Problem Statement & Scope**](./docs/01-problem-statement-and-scope.md) | Objective, core functional scope for Version 1, and future out-of-scope features. |
| **02** | [**Requirement Analysis & Scale Estimation**](./docs/02-requirement-analysis-and-scale.md) | Functional/Non-functional requirements, SLA definitions, and DAU/QPS/Storage capacity math. |
| **03** | [**High-Level Architecture (HLA)**](./docs/03-high-level-architecture.md) | Component interaction, load balancing, API Gateway, Redis, Kafka, and stateless design principles. |
| **04** | [**Domain Modeling**](./docs/04-domain-modeling.md) | Core domain entities (`User`, `Tweet`, `Follow`, `Like`, `Comment`, `Notification`, `Media`) and ER definitions. |
| **05** | [**Database Design & SQL Schema**](./docs/05-database-design.md) | PostgreSQL table DDLs, indexing strategy, foreign/composite keys, and query performance optimization. |
| **06** | [**API Contracts & REST Specifications**](./docs/06-api-design.md) | RESTful URL naming, HTTP methods, status codes, JSON request/response payloads, and cursor pagination. |
| **07** | [**Low-Level Design (LLD)**](./docs/07-low-level-design.md) | Layered architecture (Router $\rightarrow$ Controller $\rightarrow$ Service $\rightarrow$ Repository), feature folder structure, and SOLID rules. |
| **08** | [**Authentication & Security System**](./docs/08-authentication-system.md) | Password hashing (Argon2/bcrypt), JWT Access/Refresh token flows, middleware pipelines, and sequence diagrams. |
| **09** | [**Development & Scaling Strategy**](./docs/09-development-and-scaling-strategy.md) | The 6-stage evolutionary roadmap from modular monolith to high-scale microservices. |

---

## 🛠️ Technology Stack

### Core Runtime & Language
- **Node.js**: Event-driven, non-blocking I/O runtime for high-concurrency API handling.
- **TypeScript**: Static typing for domain safety, DTO validation, and maintainable enterprise codebases.
- **Express.js**: Fast, minimalist web framework for routing and middleware pipelines.

### Data & Infrastructure
- **PostgreSQL**: Primary relational database ensuring ACID compliance, transactional integrity, and relational data modeling.
- **Redis**: In-memory data store used for session storage, rate limiting, and home feed caching (Fan-out on write).
- **Apache Kafka**: Distributed event streaming platform for asynchronous background processing (notifications, analytics, feeds).
- **AWS S3 / Cloud Storage**: Object storage for user profile pictures and tweet multimedia files.

### Security & Quality
- **JSON Web Tokens (JWT)**: Stateless, cryptographically signed access and refresh tokens.
- **Argon2 / bcrypt**: Industry-standard cryptographic algorithms for secure password hashing.
- **Zod / Joi**: Runtime schema validation for incoming request bodies, queries, and headers.
- **Winston / Morgan**: Structured JSON logging and HTTP request tracing.

---

## 🎯 Engineering Philosophy

1. **Think Before Coding**: A well-designed schema and clear API contract prevent 90% of technical debt and refactoring.
2. **Strict Separation of Concerns**: Controllers handle HTTP; Services handle business rules; Repositories handle SQL. Never mix them.
3. **Stateless Scalability**: Application servers must remain stateless so any request can be routed to any server instance.
4. **Evolutionary Architecture**: Don't build microservices on Day 1. Build a clean modular monolith that can be split into microservices without rewriting business logic.

---

## 🏁 Getting Started

To explore the architecture, start by reading the [**Master System Design Blueprint (`SYSTEM_DESIGN.md`)**](./SYSTEM_DESIGN.md), then follow the sequential chapters in the [`docs/`](./docs/) directory.

Once the design review is complete, proceed to **Phase 10 (Project Setup)** to begin implementation!
