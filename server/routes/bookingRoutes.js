import express from 'express';
import { 
  createBooking, 
  getMyBookings, 
  getProviderBookings, 
  getBookingById, 
  updateBookingStatus, 
  cancelBooking 
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js'; // Note the .js extension!

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/provider-bookings', protect, getProviderBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/status', protect, updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

export default router;