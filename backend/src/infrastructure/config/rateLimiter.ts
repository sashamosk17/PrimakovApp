import rateLimit from 'express-rate-limit';

// Strict rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (was 15 - too long for development)
  max: 20, // 20 requests per window (was 5 - too strict for development)
  message: {
    status: 'error',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts. Please try again in 5 minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in test environment
  skip: () => process.env.NODE_ENV === 'test',
});

// Moderate rate limiting for write operations
export const writeRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    status: 'error',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// General API rate limiting
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    status: 'error',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});
