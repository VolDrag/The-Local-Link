// User routes
// /api/users
//Debashish
// TODO: Import controllers and middleware
// TODO: Define routes for user profile operations
import express from 'express';
import { getUserProfile, createorupdateUserProfile, deleteUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
const router = express.Router();

// Get user profile
router.get('/:userId', getUserProfile);

// Create or Update user profile
router.put('/profile', protect, uploadMiddleware.single('image'), createorupdateUserProfile);

// Delete user account
router.delete('/:userId', protect, deleteUser); 




export default router;