/**
 * Rate Limiting Middleware
 * Prevents brute-force attacks on sensitive endpoints
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

// Create Redis client (optional - uses in-memory if Redis unavailable)
let redisClient = null;

try {
  redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  });
} catch (err) {
  console.warn('Redis unavailable, using memory store for rate limiting');
}

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:general:',
  }) : undefined,
});

// Strict rate limiter for login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 5, // 5 login attempts per window
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful logins
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:login:',
  }) : undefined,
});

// Payment verification rate limiter
export const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 payment verification attempts per minute
  message: 'Too many payment verification attempts.',
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:payment:',
  }) : undefined,
});

// Registration/user creation limiter
export const createUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 new registrations per IP per hour
  message: 'Too many accounts created from this IP, please try again later.',
  store: redisClient ? new RedisStore({
    client: redisClient,
    prefix: 'rl:user:',
  }) : undefined,
});

export default {
  generalLimiter,
  loginLimiter,
  paymentLimiter,
  createUserLimiter,
};
