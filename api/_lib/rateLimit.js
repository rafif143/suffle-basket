/**
 * Rate Limiting Configuration
 * Protects API from brute force and DDoS attacks
 */

import rateLimit from 'express-rate-limit';

/**
 * Strict limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: {
    success: false,
    message: 'Too many login attempts, please try again in 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
});

/**
 * Moderate limiter for registration
 * Prevents spam registrations
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 registrations per hour per IP
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General limiter for other endpoints
 * Prevents API abuse
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: {
    success: false,
    message: 'Too many requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict limiter for score updates
 * Prevents score manipulation
 */
export const scoreLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 score updates per 5 minutes
  message: {
    success: false,
    message: 'Too many score updates, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Very strict limiter for draw operations
 * Prevents draw manipulation
 */
export const drawLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 draw operations per 10 minutes
  message: {
    success: false,
    message: 'Too many draw operations, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
