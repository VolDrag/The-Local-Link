import express from 'express';
import { getUserProfile, createorupdateUserProfile, deleteUser } from '../controllers/userController.js';
import {
    uploadPortfolioImages,
    getPortfolio,
    updatePortfolioItem,
    deletePortfolioItem,
    clearPortfolio,
} from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfile, uploadPortfolio } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.put('/profile', protect, uploadProfile.single('image'), createorupdateUserProfile);

router.post('/portfolio/upload', protect, uploadPortfolio.array('images', 10), uploadPortfolioImages);
router.get('/portfolio/:userId', getPortfolio);
router.put('/portfolio/:itemIndex', protect, updatePortfolioItem);
router.delete('/portfolio/:itemIndex', protect, deletePortfolioItem);
router.delete('/portfolio', protect, clearPortfolio);

router.get('/:userId', getUserProfile);
router.delete('/:userId', protect, deleteUser);

export default router;
