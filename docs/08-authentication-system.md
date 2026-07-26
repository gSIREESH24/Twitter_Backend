# Chapter 8. Authentication & Security System

> **How do we keep accounts safe?** A simple guide to why we never store plain passwords, how login badges (JWTs) work, and how we use Access & Refresh tokens to keep users logged in securely!

---

## 1. Authentication vs. Authorization (What is the difference?)

Many beginners confuse these two words! Here is the simple difference:

* **🔐 Authentication (Who are you?)**: Verifying someone's identity. When you type your email `sireesh@gmail.com` and password, the server checks if you really are Sireesh.
* **👮 Authorization (What are you allowed to do?)**: Checking permissions. Once logged in, if User A tries to click "Delete Tweet #101", the server checks: *"Is User A the actual author of Tweet #101?"* If not, permission is denied!

---

## 2. Why We NEVER Store Plaintext Passwords

If you store passwords as normal text (`password123`) in a database, and a hacker ever steals a database backup, every single user's account is compromised instantly!

### 🛡️ The Solution: Password Hashing (Argon2 / bcrypt)
We use industry-standard cryptographic hashing algorithms like **Argon2** or **bcrypt**:
1. When you sign up with password `SecurePassword123`, we run it through a one-way mathematical blender that adds a random secret string (called a **Salt**).
2. The output becomes an unreadable hash string: `$2b$12$e9k...Z8q...`
3. We store ONLY this hash in the database. Even we, the system engineers, cannot reverse this hash to see your real password!
4. When you log in next time, we run your typed password through the exact same blender and see if the resulting hash matches the one in the database!

---

## 3. How Login Badges Work (JSON Web Tokens - JWT)

When you open Twitter on your phone, you don't want to type your password every single time you click "Like" or "Retweet". How does the server remember you?

1. **You Log In**: You send your email and password once.
2. **The Server Gives You a Badge**: If correct, the server creates a digital ID badge called a **JSON Web Token (JWT)** and signs it with a secret cryptographic stamp.
3. **Every Request**: When you click "Like Tweet", your phone automatically attaches this JWT badge to the request.
4. **Instant Verification**: Our server checks the badge's stamp. Because it's valid, the server knows who you are in **1 millisecond** without checking the database!

> ⚠️ **Important Security Rule**: Anyone who looks at a JWT badge can read what is written inside it! Therefore, **we never store passwords, social security numbers, or secrets inside a JWT badge!** We only store simple info like your User ID and Username.

---

## 4. The Dual-Token Lifecycle (Access vs. Refresh Tokens)

What if a hacker intercepts your JWT badge on public Wi-Fi? If that badge lasted for 1 whole year, the hacker would have access to your account for a year!

To prevent this, we use a **Dual Token System**:

| Token Type | Lifespan | How It Works & Why It is Safe |
| :--- | :---: | :--- |
| **🎟️ Access Token** | **15 Minutes** | This is your everyday working badge. Your phone sends it with every API request. Because it expires in just 15 minutes, if a hacker steals it, it becomes useless very quickly! |
| **🍪 Refresh Token**| **30 Days** | Stored safely in a hidden, encrypted browser cookie (`HttpOnly`). When your 15-minute Access Token expires, your phone quietly presents this Refresh Token to get a fresh Access Token in the background—**without asking you to re-type your password!** |

---

## 5. How It Looks in Action (Login & Request Flow)

Here is a clean ASCII visual diagram showing how login and API requests flow securely between your phone and our server:

### 1️⃣ The Login Flow
```
[ 📱 Phone App ]               [ 🌐 Express Server ]               [ 🐘 PostgreSQL DB ]
       │                                 │                                   │
       │─── 1. POST /login (Email, Pass)►│                                   │
       │                                 │─── 2. Fetch User by Email ───────►│
       │                                 │◄── 3. Return Hashed Password ─────│
       │                                 │                                   │
       │                                 │─── 4. Check if Hashes Match!      │
       │◄── 5. Return JWT & Refresh Cook─│                                   │
```

### 2️⃣ The Protected API Request Flow
```
[ 📱 Phone App ]               [ 🔐 Auth Middleware ]               [ 📝 Tweet Controller ]
       │                                 │                                   │
       │─── 1. POST /tweets + JWT Badge─►│                                   │
       │                                 │─── 2. Check Badge Signature       │
       │                                 │─── 3. Badge Valid! Attach User ID │
       │                                 │──────────────────────────────────►│
       │                                 │                                   │─── 4. Save Tweet!
       │◄── 5. Reply: 201 Tweet Created!─│◄──────────────────────────────────│
```

---

## 6. How Logout Works (Revoking Tokens)

When you click "Log Out", your phone deletes the 15-minute Access Token from its memory. 

To make sure nobody can reuse your 30-day Refresh Token, we take its unique token ID and place it onto a **Redis Blacklist** (like a VIP club bouncer list). If anyone ever tries to use that Refresh Token again, our server checks Redis, sees it on the blacklist, and rejects it immediately!
