// Review routes
import express from 'express';
import {
  createReview,
  getServiceReviews,
  respondToReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { reviewCreateSchema } from '../validators/bookingValidators.js';

const router = express.Router();

router.get('/service/:serviceId', getServiceReviews);

router.post('/', protect, reviewLimiter, validate(reviewCreateSchema), createReview);
router.put('/:id/response', protect, respondToReview);

export default router;