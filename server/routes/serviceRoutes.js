// ifty
import express from 'express';
import {
  getServices,
  getServiceById,
  getCountries,
  getCitiesByCountry,
  getAreasByCity,
  createService,  
  updateService,  //feature 15
  deleteService,  //feature 15
  toggleAvailability, //feature 16  
  updateServicePricing, //feature 21
} from '../controllers/serviceController.js';
import { getServiceReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';    // Authentication middleware
import { authorize } from '../middleware/roleMiddleware.js';  // Role-based authorization middleware

const router = express.Router();

// Location routes (MUST be before :id routes)
router.get('/locations/countries', getCountries);
router.get('/locations/cities/:country', getCitiesByCountry);
router.get('/locations/areas/:country/:city', getAreasByCity);

// Public service routes
router.get('/', getServices);
router.get('/:id', getServiceById);
router.get('/:serviceId/reviews', getServiceReviews);

//##############Rafi###################
// Protected routes - Provider only for create, update, delete, toggle availability, update pricing  
router.post('/', protect, authorize('provider'), createService);//
router.patch('/:id/availability', protect, authorize('provider'), toggleAvailability);//feature 16
router.patch('/:id/pricing', protect, authorize('provider'), updateServicePricing);//feature 21
router.put('/:id', protect, authorize('provider'), updateService);//feature 15
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);//feature 15

export default router;
