// Booking routes
// /api/bookings

import express from 'express';
import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  getBookingHistory, //feature 19
  getProviderBookingHistory //feature 19
  //cancelBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// User routes
router.post('/', createBooking);                           
router.get('/my-bookings', getMyBookings);  
router.get('/history', getBookingHistory);               // MUST BE BEFORE /:id

// Provider routes
router.get('/provider-bookings', authorize('provider'), getProviderBookings);  
router.get('/provider-history', authorize('provider'), getProviderBookingHistory);  // MUST BE BEFORE /:id

// Status management routes (BEFORE /:id)
router.patch('/:id/status', authorize('provider'), updateBookingStatus);

// Shared routes - MUST BE LAST
router.get('/:id', getBookingById);                       // Get booking by ID

export default router;
