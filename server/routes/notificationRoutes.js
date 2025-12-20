// Anupam - Notification Routes
import express from 'express';
import { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification 
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all notifications for logged-in user
router.get('/', getMyNotifications);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Mark single notification as read
router.put('/:id/read', markAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;