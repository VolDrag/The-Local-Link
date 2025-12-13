// ifty
import express from 'express';
import {
  getServices,
  getServiceById,
  getCountries,
  getCitiesByCountry,
  getAreasByCity,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { getServiceReviews, createReview, canReviewService } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';    // Authentication middleware
import { authorize } from '../middleware/roleMiddleware.js';  // Role-based authorization middleware

const router = express.Router();

// Location routes (MUST be before :id routes)
router.get('/locations/countries', getCountries);
router.get('/locations/cities/:country', getCitiesByCountry);
router.get('/locations/areas/:country/:city', getAreasByCity);

// Public service routes
router.get('/', getServices);

// Review routes (MUST be before /:id route to avoid conflict)
router.get('/:serviceId/reviews', getServiceReviews);
router.post('/:serviceId/reviews', protect, createReview);
router.get('/:serviceId/can-review', protect, canReviewService);

// Service by ID route (after specific routes)
router.get('/:id', getServiceById);

// Protected routes - Provider only for create, update, delete  //##############Rafi###################
router.post('/', protect, authorize('provider'), createService);
router.put('/:id', protect, authorize('provider'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

export default router;