# Chapter 2. Requirement Analysis & Scale Estimation

> **Objective**: Define concrete functional and non-functional requirements, establish strict Service Level Agreements (SLAs), and perform mathematical scale estimations for traffic, storage, and bandwidth to size our database and caching infrastructure.

---

## 2.1 Functional Requirements

Functional requirements define what the system *must do* from an end-user perspective:

1.  **Account Security**: Users must be able to sign up with a unique email and username, authenticate securely, and receive stateless access tokens.
2.  **Tweet Publishing**: Authenticated users must be able to post text tweets ($\le 280$ characters) with up to 4 attached images.
3.  **Social Graph**: Users must be able to follow and unfollow other users, establishing unidirectional relationships.
4.  **Timeline Generation**: Users must be presented with a personalized home feed showing tweets from accounts they follow, ordered chronologically.
5.  **Engagement**: Users must be able to like, unlike, and comment on tweets.
6.  **Notifications**: Users must receive notifications when someone interacts with their tweets or follows their account.
7.  **Search**: Users must be able to query the system for profiles and tweets matching specific text strings.

---

## 2.2 Non-Functional Requirements (SLAs & Engineering Goals)

Non-functional requirements define *how well* the system must perform under load:

| Metric / Goal | Target Requirement | Engineering Strategy |
| :--- | :--- | :--- |
| **High Availability** | **99.99% Uptime** ($\le 52.6$ min downtime/year) | Eliminate single points of failure (SPOF) via multi-node deployments, load balancing, and database read replicas. |
| **Low Latency (Reads)** | **$\le 100\text{ms}$** at 95th percentile | Cache hot home feeds and user profiles in Redis; utilize cursor-based pagination and database indexing. |
| **Low Latency (Writes)**| **$\le 200\text{ms}$** at 95th percentile | Asynchronously offload heavy tasks (feed fan-out, push notifications) to Apache Kafka background workers. |
| **Scalability** | Support **10x traffic spikes** during major events | Stateless API server instances scaling horizontally behind an Nginx/AWS ALB load balancer. |
| **Eventual Consistency** | Feeds updated within **$\le 2\text{seconds}$** | While tweets and likes are strictly ACID in PostgreSQL, timeline fan-out across followers follows eventual consistency. |
| **Security** | Zero data breaches or unauthorized modifications | Strict JWT validation, Argont2 password hashing, HTTPS encryption in transit, and SQL parameterization. |

---

## 2.3 Scale Estimation & Back-of-the-Envelope Math

To design a system that won't collapse under real-world load, we must calculate exact quantitative requirements based on standard baseline assumptions.

### 1. Traffic & User Baseline Assumptions
*   **Total Registered Users**: $10\text{ Million}$
*   **Daily Active Users (DAU)**: $1\text{ Million}$
*   **Average Tweets Published per DAU**: $5\text{ tweets/day}$ $\rightarrow$ **$5\text{ Million new tweets/day}$**
*   **Average Feed Views per DAU**: $20\text{ views/day}$ $\rightarrow$ **$20\text{ Million timeline requests/day}$**
*   **Average Likes per DAU**: $50\text{ likes/day}$ $\rightarrow$ **$50\text{ Million likes/day}$**
*   **Average Comments per DAU**: $10\text{ comments/day}$ $\rightarrow$ **$10\text{ Million comments/day}$**
*   **Read-to-Write Ratio**: Approximately **$5:1$** (Twitter is a read-heavy system).

---

### 2. Query Per Second (QPS) Calculations

There are $86,400$ seconds in a day. For safety in backend sizing, we round down to $100,000\text{ seconds/day}$.

$$\text{Average Tweet Write QPS} = \frac{5,000,000\text{ tweets}}{100,000\text{ seconds}} = \mathbf{50\text{ QPS}}$$

$$\text{Peak Tweet Write QPS (3x Spike)} = 50 \times 3 = \mathbf{150\text{ QPS}}$$

$$\text{Average Feed Read QPS} = \frac{20,000,000\text{ reads}}{100,000\text{ seconds}} = \mathbf{200\text{ QPS}}$$

$$\text{Peak Feed Read QPS (3x Spike)} = 200 \times 3 = \mathbf{600\text{ QPS}}$$

$$\text{Average Engagement (Likes + Comments) QPS} = \frac{60,000,000\text{ actions}}{100,000\text{ seconds}} = \mathbf{600\text{ QPS}}$$

$$\text{Total Peak System QPS} \approx \mathbf{1,500\text{ to } 2,500\text{ requests/second}}$$

> 💡 **Architectural Takeaway**: A single well-optimized Node.js/Express server can handle $\approx 500\text{ to } 1,000\text{ QPS}$ of basic I/O tasks. To comfortably handle our peak load with redundancy, our production deployment will require **3 to 4 stateless API server instances** running behind a load balancer.

---

### 3. Storage Capacity Estimation

Let's calculate the storage required to store 5 million new tweets every day over a **5-year retention period**.

#### A. Single Tweet Record Footprint
*   `id` (UUIDv4): $16\text{ bytes}$
*   `user_id` (UUIDv4): $16\text{ bytes}$
*   `content` (up to 280 chars UTF-8): $\approx 300\text{ bytes}$
*   `created_at`, `updated_at` (Timestamps): $16\text{ bytes}$
*   Metadata & Index Overhead: $\approx 152\text{ bytes}$
*   **Total Size per Tweet Record** $\approx \mathbf{500\text{ bytes}}$

#### B. Daily & Annual Relational Storage (PostgreSQL)
$$\text{Daily Tweet Storage} = 5,000,000\text{ tweets} \times 500\text{ bytes} = 2.5\text{ GB/day}$$

$$\text{Annual Tweet Storage} = 2.5\text{ GB/day} \times 365\text{ days} = \mathbf{912.5\text{ GB/year}}$$

$$\text{5-Year Relational Storage Need} \approx \mathbf{4.56\text{ TB}}$$

> 💡 **Architectural Takeaway**: $4.5\text{ TB}$ over 5 years easily fits within a modern single PostgreSQL server equipped with SSD storage (which scales up to $16\text{ TB}+$ on AWS RDS). We do **not** need complex database sharding in V1; read replicas and standard indexing will easily support this load.

#### C. Media Storage Requirements (AWS S3)
*   Assume **20% of tweets** ($1\text{ Million tweets/day}$) include an image attachment.
*   Average image file size after compression: $\approx 200\text{ KB}$.

$$\text{Daily Media Storage} = 1,000,000 \times 200\text{ KB} = \mathbf{200\text{ GB/day}}$$

$$\text{Annual Media Storage} = 200\text{ GB/day} \times 365\text{ days} = \mathbf{73\text{ TB/year}}$$

> 💡 **Architectural Takeaway**: Relational databases should never store binary media files. Media will be offloaded to **AWS S3 / Cloud Storage**, while PostgreSQL only stores the $100\text{-byte}$ URL text string referencing the object.

---

### 4. Memory & Caching Requirements (Redis Sizing)

To meet our $\le 100\text{ms}$ read SLA, we must cache the home feeds of active users in **Redis**.

#### Feed Cache Sizing Math
*   We cache the latest **200 tweet IDs** for each Daily Active User ($1\text{ Million DAU}$).
*   Each Tweet ID (UUID) is $16\text{ bytes}$ in memory.
*   Overhead per list entry in Redis: $\approx 24\text{ bytes}$.
*   Total memory per user feed $= 200 \times 40\text{ bytes} = 8\text{ KB}$.

$$\text{Total Redis Feed Cache Memory} = 1,000,000\text{ DAU} \times 8\text{ KB} = \mathbf{8\text{ GB of RAM}}$$

> 💡 **Architectural Takeaway**: An **$8\text{ GB}$ to $16\text{ GB}$ Redis instance** will easily hold the pre-computed timelines of every single active user in memory, guaranteeing sub-millisecond timeline retrieval!

---

## 2.4 Summary of Sizing Requirements

| Infrastructure Component | Estimated Sizing Requirement | Architectural Solution |
| :--- | :--- | :--- |
| **API Servers** | $2,500\text{ Peak QPS}$ | 4x Horizontal Node.js instances behind Load Balancer |
| **Relational DB (PostgreSQL)**| $1\text{ TB/year}$ ($50\text{ Write QPS}$) | Single Primary DB with 2x Read Replicas + B-Tree Indexes |
| **In-Memory Cache (Redis)** | $8\text{ GB RAM}$ | 16GB Redis Cluster (LRU eviction policy) |
| **Object Storage (S3)** | $73\text{ TB/year}$ | AWS S3 Bucket with CloudFront CDN distribution |
