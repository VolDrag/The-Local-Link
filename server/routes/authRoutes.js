// Authentication routes
// /api/auth
//Debashish
import express from 'express';
import { registerUser, loginUser, getMe, adminLogin, setupAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Regular user routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Admin routes
router.post('/admin/login', adminLogin);
router.get('/admin/me', protect, adminOnly, getMe); 
// router.post('/admin/setup', setupAdmin); // REMOVE AFTER CREATING ADMIN

export default router;