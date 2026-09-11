import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  adminLogin,
  verifyEmail,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  refreshSession,
  logoutUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.get('/me', protect, getMe);
router.post('/refresh', authLimiter, refreshSession);
router.post('/logout', logoutUser);

router.post('/verify-email', authLimiter, validate(verifyEmailSchema), verifyEmail);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-code', authLimiter, verifyResetCode);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

router.post('/admin/login', authLimiter, validate(loginSchema), adminLogin);
router.get('/admin/me', protect, adminOnly, getMe);

export default router;
