# Monitoring and Observability Architecture

This document outlines the Phase 2 monitoring stack added to the Twitter Backend, transitioning the service from a black box into a fully observable architecture.

## Overview
We introduced industry-standard metrics collection and visualization tools to track system health, monitor performance, and analyze resource utilization across all services.

### Core Components

1. **Prometheus (Metrics Database)**: 
   - Acts as our central Time-Series Database.
   - Scrapes metrics from our Node.js API and all connected infrastructure at 15-second intervals.
   - Accessible locally at `http://localhost:9090`.

2. **Grafana (Visualization Dashboard)**:
   - Connects to Prometheus to create powerful, customizable visualizations and dashboards.
   - Accessible locally at `http://localhost:3001` (Default login: `admin` / `admin`).

3. **Exporters (Translators)**:
   - **Node.js Metrics**: We used `express-prom-bundle` and `prom-client` to natively expose API metrics (response times, error rates, throughput) at the `/metrics` endpoint.
   - **Postgres Exporter**: Connects to our PostgreSQL database to report on active connections, slow queries, and cache hit rates.
   - **Redis Exporter**: Connects to Redis to report on memory usage, evicted keys, and cache hit/miss ratios.
   - **Kafka Exporter**: Connects to the Kafka broker to monitor consumer lag, topic creation, and message rates.
   - **cAdvisor**: A Google container monitor that connects to the Docker daemon to report CPU, memory, and network usage of all running containers.

---

## Docker Commands

To run this entire infrastructure smoothly, we use Docker Compose. The `docker-compose.yml` file is configured to spin up the API, databases, message brokers, and the entire monitoring stack simultaneously.

### 1. Start the Environment
To build the latest images and start all containers in the background, run:
```bash
docker compose up --build -d
```
*Note: The `--build` flag ensures that any new `npm` packages or code changes in the API are compiled into the container image before it starts.*

### 2. Check the Status
To see which containers are running and their health statuses:
```bash
docker compose ps
```
You should see all 10 containers running, including `twitter_grafana` and `twitter_prometheus`.

### 3. Stop the Environment
When you are done developing or want to gracefully shut down all services, run:
```bash
docker compose down
```
*Note: This stops and removes the containers and networks, but your data is safely preserved in Docker volumes (e.g., `postgres_data`, `redis_data`, `kafka_data`).*
