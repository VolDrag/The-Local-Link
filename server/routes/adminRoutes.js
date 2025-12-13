// Admin routes
// /api/admin

import express from 'express';
const router = express.Router();
import { getDashboardStats, getAllUsers, getAllServices } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

// User management routes
router.get('/users', getAllUsers);

// Service management routes
router.get('/services', getAllServices);

export default router;
