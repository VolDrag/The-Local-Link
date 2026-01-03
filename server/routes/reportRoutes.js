// Report Routes
import express from 'express';
import { createReport, getUserReports, getReportById } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new report
router.post('/', createReport);

// Get current user's reports
router.get('/my-reports', getUserReports);

// Get single report by ID
router.get('/:id', getReportById);

export default router;
