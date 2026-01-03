// Admin routes
// /api/admin

import express from 'express';
const router = express.Router();
import { 
  getDashboardStats, 
  getAllUsers, 
  getAllServices, 
  getAllBookings,
  createCategory, 
  getAllCategories, 
  updateCategory, 
  deleteCategory,
  getAllReports,
  getReport,
  updateReport,
  deleteReport
} from '../controllers/adminController.js';
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

// Booking management routes
router.get('/bookings', getAllBookings);

// Category management routes
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Report management routes
router.get('/reports', getAllReports);
router.get('/reports/:id', getReport);
router.put('/reports/:id', updateReport);
router.delete('/reports/:id', deleteReport);

export default router;
