import express from 'express';
import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  getBookingHistory,
  getProviderBookingHistory,
  cancelBooking,
  flagNoShow,
  proposeReschedule,
  respondReschedule,
  markEnRoute,
} from '../controllers/bookingController.js';
import { getMessages, postMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import {
  createBookingSchema,
  updateStatusSchema,
  cancelBookingSchema,
  rescheduleSchema,
  messageSchema,
} from '../validators/bookingValidators.js';

const router = express.Router();

router.use(protect);

router.post('/', bookingLimiter, validate(createBookingSchema), createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/history', getBookingHistory);

router.get('/provider-bookings', authorize('provider'), getProviderBookings);
router.get('/provider-history', authorize('provider'), getProviderBookingHistory);

router.patch('/:id/status', authorize('provider'), validate(updateStatusSchema), updateBookingStatus);
router.patch('/:id/cancel', validate(cancelBookingSchema), cancelBooking);
router.post('/:id/no-show', flagNoShow);
router.post('/:id/reschedule', validate(rescheduleSchema), proposeReschedule);
router.post('/:id/reschedule/respond', respondReschedule);
router.post('/:id/en-route', authorize('provider'), markEnRoute);

router.get('/:id/messages', getMessages);
router.post('/:id/messages', validate(messageSchema), postMessage);

router.get('/:id', getBookingById);

export default router;
