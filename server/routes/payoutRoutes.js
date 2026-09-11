import express from 'express';
import { requestPayout, getMyPayouts } from '../controllers/payoutController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { payoutRequestSchema } from '../validators/bookingValidators.js';

const router = express.Router();
router.use(protect);
router.get('/', getMyPayouts);
router.post('/request', validate(payoutRequestSchema), requestPayout);

export default router;
