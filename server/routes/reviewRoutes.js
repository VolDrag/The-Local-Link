// Review routes
import express from 'express';
import {
  createReview,
  getServiceReviews,
  respondToReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/service/:serviceId', getServiceReviews);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id/response', protect, respondToReview);

export default router;