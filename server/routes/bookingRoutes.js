// Booking routes
// /api/bookings

import express from 'express';
import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  //cancelBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// User routes
router.post('/', createBooking);                           // Create a new booking
router.get('/my-bookings', getMyBookings);                 // Get user's bookings

// Provider routes
router.get('/provider-bookings', authorize('provider'), getProviderBookings);  // Get provider's bookings

// Shared routes (user can view their booking, provider can view bookings for their services)
router.get('/:id', getBookingById);                        // Get booking by ID

// Status management routes
router.patch('/:id/status', authorize('provider'), updateBookingStatus);  // Provider updates booking status
//router.patch('/:id/cancel', cancelBooking);                // Cancel booking (user or provider)

// for updating booking status
router.put('/:bookingId/status', protect, updateBookingStatus); //Debashish 


export default router;
