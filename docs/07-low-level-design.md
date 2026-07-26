# Chapter 7. Software Layers (LLD)

> **Where does the code belong?** A simple guide to our 4-layer architecture, feature-based folders, SOLID engineering principles, and how we catch errors cleanly in one place.

---

## 1. The Building Blueprint (Why We Use Layers)

Think of software architecture like constructing a building. If you put the electrical wires, water pipes, and concrete columns all in one messy pile, fixing a leaking pipe would tear down the wall!

In a professional backend, every incoming HTTP request travels through **4 distinct layers**. Every layer has **ONE specific job** and is never allowed to interfere with the others:

```
[ Incoming HTTP Request ]
          │
          ▼
┌────────────────────────────────────────────────────────┐
│ 1. Express Router                                      │
│    👉 The Reception Desk: Looks at the URL (/tweets)   │
│       and sends the request to the correct Controller. │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Controller Layer                                    │
│    👉 The Waiter: Takes the order (user input), asks   │
│       the Service to prepare it, and serves the reply. │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Service Layer (Business Logic)                      │
│    👉 The Head Chef: Knows the actual recipes and      │
│       rules ("Is content empty? Is user banned?").     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Repository Layer                                    │
│    👉 The Stockroom Clerk: The ONLY layer allowed to   │
│       talk to PostgreSQL (INSERT, SELECT, DELETE).     │
└────────────────────────────────────────────────────────┘
```

### 🚫 The Strict Rules of Separation
* **The Controller MUST NOT**: Write database SQL queries or decide business rules.
* **The Service MUST NOT**: Know about web HTTP status codes (`200 OK`, `404 Not Found`) or web headers.
* **The Repository MUST NOT**: Check if a user is banned or make business decisions—it simply saves or reads data!

---

## 2. Feature-Based Folders (Keeping Code Clean)

Many beginners group files by "type" (putting 50 controllers in one folder and 50 services in another). Imagine putting all the steering wheels of 10 different cars in one box and all the engines in another box—it's super confusing!

We organize our codebase by **Feature (Domain)**. Everything related to Users stays in the `/user` folder, and everything related to Tweets stays in the `/tweet` folder:

```
src/
├── config/              # Infrastructure setup (Database & Redis connections)
├── common/              # Shared tools used across the whole app
│   ├── logger/          # Structured JSON logger (Winston)
│   ├── middleware/      # Login badge checkers & input validation
│   └── errors/          # Custom error types
│
├── modules/             # Feature Domain Modules (The Brains!)
│   ├── user/
│   │   ├── user.controller.ts  # Handles HTTP requests for profiles
│   │   ├── user.service.ts     # Business rules for users
│   │   ├── user.repository.ts  # Database SQL queries for users
│   │   └── user.routes.ts      # URL route definitions (/users/*)
│   │
│   ├── tweet/
│   │   ├── tweet.controller.ts # Handles HTTP requests for tweets
│   │   ├── tweet.service.ts    # Business rules for posting tweets
│   │   ├── tweet.repository.ts # Database SQL queries for tweets
│   │   └── tweet.routes.ts     # URL route definitions (/tweets/*)
│   │
│   ├── follow/
│   └── notification/
│
├── app.ts               # Web server setup
└── server.ts            # Starting up the app
```

> 💡 **Why is this awesome?** If we ever decide to turn our `Tweet Module` into a separate Microservice later, we can literally copy the `/tweet` folder into a new project and it works instantly!

---

## 3. SOLID Principles in Plain English

We follow the 5 **SOLID Principles** to make sure our codebase remains clean and bug-free as it grows:

1. **S – Single Responsibility**: A class should only have one job. Don't let a `UserService` handle logins, send warning emails, and format photos! Separate those into an `AuthService`, `EmailService`, and `PhotoService`.
2. **O – Open / Closed**: You should be able to add new features without breaking existing code. If we add a new "Mention Notification", we write a new small plugin file rather than rewriting our main notification loop.
3. **L – Liskov Substitution**: Services should depend on general interfaces, not specific database brands. If we swap PostgreSQL for a test memory database during automated testing, our `TweetService` shouldn't notice the difference!
4. **I – Interface Segregation**: Don't create giant, confusing interface contracts with 50 methods. Keep them small and focused (e.g., `ITweetReader` vs `ITweetWriter`).
5. **D – Dependency Inversion**: Don't hardcode database connections directly inside your service. Pass them in from the outside (called **Dependency Injection**), making your code super easy to test!

---

## 4. Centralized Error Handling (No More Messy Try/Catch!)

In amateur codebases, every single API URL handler is wrapped in repeated `try { ... } catch (err) { ... }` blocks—repeated over 200 times!

### ✅ Our High-Level Solution
We use a **Centralized Global Error Handler**.
* Our controllers write clean, readable code without messy `try/catch` blocks.
* If anything goes wrong (e.g., a tweet isn't found or the database goes offline), an automatic safety net catches the error and forwards it to our **Global Error Middleware**.
* The global handler automatically logs the problem and sends a clean, polite JSON error message back to the mobile app!

---

## 5. Helpful Infrastructure Tools

* **Configuration Management (`/config`)**: We never hardcode passwords or database URLs in our code! We read them from secure `.env` files and validate them when the server starts up.
* **Structured Logging (Winston)**: We never use simple `console.log()`. We use structured JSON logs that record timestamps, error details, and execution speed so we can debug issues instantly in production!
* **Health Check Endpoint (`GET /health`)**: Our servers expose a simple `/health` URL that replies `{"status": "UP"}`. AWS Load Balancers check this every 5 seconds to make sure our server is healthy and ready to accept user traffic!
