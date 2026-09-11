import express from 'express';
import { createDispute, getMyDisputes } from '../controllers/disputeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadEvidence } from '../middleware/uploadMiddleware.js';
import { validate } from '../middleware/validate.js';
import { disputeSchema } from '../validators/bookingValidators.js';

const router = express.Router();
router.use(protect);
router.get('/', getMyDisputes);
router.post('/', uploadEvidence.array('evidence', 5), validate(disputeSchema), createDispute);

export default router;
