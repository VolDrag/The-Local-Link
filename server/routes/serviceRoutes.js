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
import { getServiceReviews } from '../controllers/reviewController.js';

const router = express.Router();

// Location routes (MUST be before :id routes)
router.get('/locations/countries', getCountries);
router.get('/locations/cities/:country', getCitiesByCountry);
router.get('/locations/areas/:country/:city', getAreasByCity);

// Public service routes
router.get('/', getServices);
router.get('/:id', getServiceById);
router.get('/:serviceId/reviews', getServiceReviews);

// Protected routes (to be implemented)
router.post('/', createService); // TODO: Add auth middleware
router.put('/:id', updateService); // TODO: Add auth middleware
router.delete('/:id', deleteService); // TODO: Add auth middleware

export default router;
