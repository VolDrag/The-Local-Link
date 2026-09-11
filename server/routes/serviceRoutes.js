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
  toggleAvailability,
  updateServicePricing,
  purchaseFeatured,
} from '../controllers/serviceController.js';
import { getServiceReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { uploadService } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/locations/countries', getCountries);
router.get('/locations/cities/:country', getCitiesByCountry);
router.get('/locations/areas/:country/:city', getAreasByCity);

router.get('/', getServices);
router.get('/:id', getServiceById);
router.get('/:serviceId/reviews', getServiceReviews);

router.post('/', protect, authorize('provider'), uploadService.array('photos', 6), createService);
router.patch('/:id/availability', protect, authorize('provider'), toggleAvailability);
router.patch('/:id/pricing', protect, authorize('provider'), updateServicePricing);
router.post('/:id/feature', protect, authorize('provider'), purchaseFeatured);
router.put('/:id', protect, authorize('provider'), uploadService.array('photos', 6), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

export default router;
