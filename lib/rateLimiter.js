/**
 * Rate Limiting Middleware (Next.js Compatible)
 * Prevents brute-force attacks on sensitive endpoints
 */

// In-memory store for rate limiting
const requestStore = new Map();

const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
};

const checkRateLimit = (key, max, windowMs) => {
  const now = Date.now();
  
  if (!requestStore.has(key)) {
    requestStore.set(key, []);
  }
  
  let attempts = requestStore.get(key);
  
  // Remove old attempts outside the window
  attempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  if (attempts.length >= max) {
    return false;
  }
  
  attempts.push(now);
  requestStore.set(key, attempts);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of requestStore.entries()) {
      const filtered = v.filter(timestamp => now - timestamp < windowMs);
      if (filtered.length === 0) {
        requestStore.delete(k);
      } else {
        requestStore.set(k, filtered);
      }
    }
  }
  
  return true;
};

// General API rate limiter
export const generalLimiter = (req, res, callback) => {
  const ip = getClientIP(req);
  const key = `general:${ip}`;
  const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
  
  if (!checkRateLimit(key, max, windowMs)) {
    return res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
    });
  }
  
  return callback();
};

// Strict rate limiter for login attempts
export const loginLimiter = (req, res, callback) => {
  const ip = getClientIP(req);
  const key = `login:${ip}`;
  const max = parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  if (!checkRateLimit(key, max, windowMs)) {
    return res.status(429).json({
      error: 'Too many login attempts, please try again after 15 minutes.',
    });
  }
  
  return callback();
};

// Payment verification rate limiter
export const paymentLimiter = (req, res, callback) => {
  const ip = getClientIP(req);
  const key = `payment:${ip}`;
  const max = 10;
  const windowMs = 60 * 1000; // 1 minute
  
  if (!checkRateLimit(key, max, windowMs)) {
    return res.status(429).json({
      error: 'Too many payment verification attempts.',
    });
  }
  
  return callback();
};

// Registration/user creation limiter
export const createUserLimiter = (req, res, callback) => {
  const ip = getClientIP(req);
  const key = `createuser:${ip}`;
  const max = 5;
  const windowMs = 60 * 60 * 1000; // 1 hour
  
  if (!checkRateLimit(key, max, windowMs)) {
    return res.status(429).json({
      error: 'Too many accounts created from this IP, please try again later.',
    });
  }
  
  return callback();
};

export default {
  generalLimiter,
  loginLimiter,
  paymentLimiter,
  createUserLimiter,
};
