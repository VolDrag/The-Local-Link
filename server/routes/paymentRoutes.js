import express from 'express';
import {
  createPaymentForBooking,
  executePayment,
  bkashCallback,
  getPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/bkash/callback', bkashCallback);
router.post('/bkash/callback', bkashCallback);
router.post('/execute', executePayment);

router.use(protect);
router.post('/bookings/:bookingId', createPaymentForBooking);
router.get('/:id', getPayment);

export default router;
