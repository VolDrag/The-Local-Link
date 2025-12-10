// Authentication routes
// /api/auth

import express from 'express';
import { registerUser, loginUser, getMe, adminLogin, setupAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Regular user routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Admin routes
router.post('/admin/login', adminLogin);
// router.post('/admin/setup', setupAdmin); // REMOVE THIS AFTER CREATING ADMIN

export default router;