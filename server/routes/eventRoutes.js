import express from 'express';
import {
  getActiveEvents,
  getEventById,
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/authenticated routes for viewing events
router.get('/', protect, getActiveEvents);
router.get('/:id', getEventById);

export default router;
