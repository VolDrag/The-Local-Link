import rateLimit from 'express-rate-limit';

const windowMs = 15 * 60 * 1000;

export const authLimiter = rateLimit({
  windowMs,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts. Please try again in 15 minutes.' },
});

export const bookingLimiter = rateLimit({
  windowMs,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many booking requests. Please try again later.' },
});

export const reviewLimiter = rateLimit({
  windowMs,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many review submissions. Please try again later.' },
});

export const generalLimiter = rateLimit({
  windowMs,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
