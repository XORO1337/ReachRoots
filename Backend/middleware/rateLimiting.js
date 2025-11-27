const rateLimit = require('express-rate-limit');

// General API rate limit - Lenient for production testing
const generalLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Lenient rate limit for authentication endpoints
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased from 15000 to 50 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for admin authentication - Security hardened
const adminAuthLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many admin login attempts. Account temporarily locked for security.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req) => {
    // Use both IP and email/username for tracking
    const identifier = req.body?.email || req.body?.username || '';
    return `${req.ip}_${identifier}`;
  },
});

// Lenient rate limit for OTP requests - Critical for testing
const otpLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Increased from 3 to 20 OTP requests per 5 minutes
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Lenient rate limit for password reset
const passwordResetLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Increased from 3 to 10 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimit,
  authLimit,
  adminAuthLimit,
  otpLimit,
  passwordResetLimit
};
