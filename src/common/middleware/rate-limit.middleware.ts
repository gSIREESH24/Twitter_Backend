import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import redisClient from "../../config/redis";
import logger from "../logger/logger";

// Lua Script for Token Bucket
const tokenBucketScript = `
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refillRate = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])
  local requested = 1

  local bucket = redis.call("HMGET", key, "tokens", "lastRefill")
  local tokens = tonumber(bucket[1])
  local lastRefill = tonumber(bucket[2])

  if tokens == nil then
    tokens = capacity
    lastRefill = now
  else
    local elapsedTime = math.max(0, now - lastRefill)
    local newTokens = elapsedTime * refillRate
    tokens = math.min(capacity, tokens + newTokens)
    lastRefill = now
  end

  if tokens >= requested then
    tokens = tokens - requested
    redis.call("HMSET", key, "tokens", tokens, "lastRefill", lastRefill)
    -- Set TTL (capacity / refill rate) + 60s buffer
    local ttl = math.ceil(capacity / refillRate) + 60
    redis.call("EXPIRE", key, ttl)
    return 1
  else
    return 0
  end
`;

export const rateLimiter = (keyPrefix: string, bucketSize: number, refillRatePerSec: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Identify the user (authenticated user ID, or IP address)
      const identifier = req.user?.userId || req.ip || "unknown";
      const key = `rate_limit:${keyPrefix}:${identifier}`;
      const now = (Date.now() / 1000).toString(); // Seconds

      // 2. Execute the Token Bucket Lua Script
      // Node Redis v4 Eval Signature
      const result = await redisClient.eval(tokenBucketScript, {
        keys: [key],
        arguments: [bucketSize.toString(), refillRatePerSec.toString(), now]
      });

      // 3. Check result (1 = allowed, 0 = rejected)
      if (result === 1) {
        next();
      } else {
        next(new AppError(429, "Too many requests. Please slow down."));
      }
    } catch (error) {
      logger.error(error, "Rate Limiter Error");
      // Fail-open: If Redis is down, we still want the application to function
      next(); 
    }
  };
};
