# Chapter 2. Requirements & Scale Math

> **How big is our system?** A simple guide to our performance goals and how we calculate the servers, storage, and memory needed for 1 Million Daily Active Users.

---

## 1. What Must the System Do? (Functional Requirements)

From a user's point of view, our system must guarantee that:

- Users can sign up, log in, and view profiles securely.
- Users can publish tweets with photos, like, comment, and follow others.
- When a user opens their app, their home feed loads instantly with the latest tweets from accounts they follow.
- Notifications arrive reliably whenever an interaction happens.

---

## 2. How Well Must It Perform? (Non-Functional Requirements)

Behind the scenes, architects define **Service Level Agreements (SLAs)**—promises of how reliable and fast the system will be under heavy traffic:

| Performance Goal         | Our Target SLA                                           | How We Achieve It (High-Level Strategy)                                                                                    |
| :----------------------- | :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **High Availability**    | **99.99% Uptime** (Less than 52 mins downtime per year!) | We run multiple server instances behind a Load Balancer. If one server crashes, traffic automatically flows to the others! |
| **Ultra-Fast Feeds**     | **Under 100 milliseconds**                               | We pre-load hot home timelines in **Redis memory** so users don't wait for slow database joins.                            |
| **Fast Tweet Posting**   | **Under 200 milliseconds**                               | When you post a tweet, we save it quickly and let **Kafka** handle sending notifications in the background!                |
| **Traffic Spike Safety** | Handle **10x traffic surges**                            | Our servers are stateless, allowing us to spin up new server copies instantly during viral events.                         |
| **Rock-Solid Security**  | Zero data leaks                                          | Hashed passwords, encrypted HTTPS traffic, and signed JWT login badges.                                                    |

---

## 3. Back-of-the-Envelope Math (How We Size Our Servers)

To make sure our database doesn't run out of disk space and our web servers don't crash, let's do some simple math using standard industry numbers!

### 👥 The Traffic Assumptions

- **Total Registered Users**: $10\text{ Million}$
- **Daily Active Users (DAU)**: $1\text{ Million}$
- **New Tweets Posted Daily**: $5\text{ Million tweets per day}$
- **Timeline Feed Views Daily**: $20\text{ Million timeline refreshes per day}$
- **Read-to-Write Ratio**: **$5:1$** (Twitter is read-heavy—people view 5 times more tweets than they post!).

---

### ⏱️ Requests Per Second (QPS)

There are roughly **$100,000\text{ seconds}$ in a day**. Let's see how many requests hit our server every second:

$$\text{Tweet Posting Speed} = \frac{5,000,000\text{ tweets}}{100,000\text{ seconds}} = \mathbf{50\text{ Tweets / second}}$$

$$\text{Feed Reading Speed} = \frac{20,000,000\text{ views}}{100,000\text{ seconds}} = \mathbf{200\text{ Feed Reads / second}}$$

$$\text{Likes & Comments Speed} = \frac{60,000,000\text{ actions}}{100,000\text{ seconds}} = \mathbf{600\text{ Actions / second}}$$

$$\text{Total Peak System Traffic} \approx \mathbf{1,500\text{ to } 2,500\text{ requests per second}}$$

> 💡 **What this means for our architecture**: A single modern Node.js server can handle about $800\text{ requests per second}$. To comfortably support $2,500\text{ peak requests}$ with backup redundancy, we will run **3 to 4 web server instances** behind an Nginx Load Balancer!

---

### 💾 Database Storage Math (5-Year Plan)

How much hard drive space do we need to store 5 million new tweets every single day for 5 years?

1. **Text Tweet Storage**: Each tweet record (ID, author ID, text content, timestamps) takes about **$500\text{ bytes}$**.
   - Daily Tweet Storage $= 5,000,000 \times 500\text{ bytes} = \mathbf{2.5\text{ GB per day}}$.
   - Annual Tweet Storage $= 2.5\text{ GB} \times 365\text{ days} = \mathbf{912\text{ GB per year}}$.
   - **5-Year Relational Database Need** $\approx \mathbf{4.5\text{ TB of disk space}}$.

2. **Photo Storage (AWS S3)**: Suppose 20% of tweets ($1\text{ Million/day}$) include a photo (averaging $200\text{ KB}$ each).
   - Daily Photo Storage $= 1,000,000 \times 200\text{ KB} = \mathbf{200\text{ GB per day}}$.
   - Annual Photo Storage $= \mathbf{73\text{ TB per year}}$.

> 💡 **What this means for our architecture**: $4.5\text{ TB}$ of text data easily fits inside a single primary PostgreSQL database server! We do **not** need complex database sharding or splitting. For images, we never store binary photo files in our relational database—we offload them directly to **AWS S3 Cloud Storage**!

---

### ⚡ Memory Cache Math (Redis Sizing)

To make home timelines load in under 100 milliseconds, we keep the latest **200 Tweet IDs** for each active user inside **Redis RAM**.

- Memory per user timeline $= 200\text{ tweets} \times 40\text{ bytes} = \mathbf{8\text{ KB per user}}$.
- Total Redis RAM needed $= 1,000,000\text{ Active Users} \times 8\text{ KB} = \mathbf{8\text{ GB of RAM}}$.

> 💡 **What this means for our architecture**: A simple **$16\text{ GB}$ Redis memory server** will easily hold the pre-built timelines of every single active user in RAM, guaranteeing lightning-fast feed scrolling!

---

## 4. Architecture Sizing Summary

| Component            | What We Need                                 | Our High-Level Solution                      |
| :------------------- | :------------------------------------------- | :------------------------------------------- |
| **Web Servers**      | Handle $2,500\text{ Peak requests/sec}$      | 4x Express API server instances behind Nginx |
| **Relational DB**    | Store $1\text{ TB/year}$ of tweet text       | 1x PostgreSQL Master + 2x Read Replicas      |
| **Hot Memory Cache** | Store $8\text{ GB}$ of active user timelines | 16GB Redis Cache Cluster                     |
| **Photo Storage**    | Store $73\text{ TB/year}$ of uploaded media  | AWS S3 Bucket + CloudFront CDN               |
