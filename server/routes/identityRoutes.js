import express from 'express';
import { submitIdentity, getMyIdentity } from '../controllers/identityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadIdentity } from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.use(protect);
router.get('/', getMyIdentity);
router.post('/', uploadIdentity.single('document'), submitIdentity);

export default router;
