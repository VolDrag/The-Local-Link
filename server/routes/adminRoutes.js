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
import { getPendingProviders, reviewIdentity } from '../controllers/identityController.js';
import { getAllDisputes, resolveDispute } from '../controllers/disputeController.js';
import { getAllPayouts, reviewPayout } from '../controllers/payoutController.js';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';
import User from '../models/User.js';
import { writeAudit } from '../utils/audit.js';

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

router.get('/providers/pending', getPendingProviders);
router.put('/providers/:id/verify', reviewIdentity);
router.put('/providers/:id/unsuspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.bookingSuspended = false;
    user.bookingSuspendedReason = undefined;
    await user.save();
    await writeAudit({
      admin: req.user,
      action: 'provider_unsuspend',
      targetType: 'provider_verification',
      targetId: user._id,
      details: {},
      req,
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unsuspend provider' });
  }
});

router.get('/disputes', getAllDisputes);
router.put('/disputes/:id', resolveDispute);

router.get('/payouts', getAllPayouts);
router.put('/payouts/:id', reviewPayout);

router.get('/audit-logs', getAuditLogs);

export default router;
