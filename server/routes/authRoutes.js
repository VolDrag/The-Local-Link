// Authentication routes
// /api/auth
//Debashish
import express from 'express';
import { registerUser, loginUser, getMe, adminLogin, verifyEmail, forgotPassword, verifyResetCode, resetPassword, setupAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';


const router = express.Router();

// Regular user routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Email verification and password reset routes
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Admin routes
router.post('/admin/login', adminLogin);
router.get('/admin/me', protect, adminOnly, getMe); 
// router.post('/admin/setup', setupAdmin); // REMOVE AFTER CREATING ADMIN


export default router;