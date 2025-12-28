// User routes
// /api/users
//Debashish
// TODO: Import controllers and middleware
// TODO: Define routes for user profile operations
import express from 'express';
import { getUserProfile, createorupdateUserProfile, deleteUser } from '../controllers/userController.js'; //feature: Portfolio Management(25)
import { 
    uploadPortfolioImages, 
    getPortfolio, 
    updatePortfolioItem, 
    deletePortfolioItem,
    clearPortfolio 
} from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
const router = express.Router();

// Get user profile
router.get('/:userId', getUserProfile);

// Create or Update user profile
router.put('/profile', protect, uploadMiddleware.single('image'), createorupdateUserProfile);

// Delete user account
router.delete('/:userId', protect, deleteUser); 

// ============ FEATURE 25: Portfolio Showcase - START ============

// STEP 1: Upload portfolio images (multiple)
router.post('/portfolio/upload', protect, uploadMiddleware.array('images', 10), uploadPortfolioImages);

// STEP 2: Get portfolio by user ID (Public access)
router.get('/portfolio/:userId', getPortfolio);

// STEP 3: Update portfolio item description
router.put('/portfolio/:itemIndex', protect, updatePortfolioItem);

// STEP 4: Delete specific portfolio item
router.delete('/portfolio/:itemIndex', protect, deletePortfolioItem);

// STEP 5: Clear all portfolio items
router.delete('/portfolio', protect, clearPortfolio);

// ============ FEATURE 25: Portfolio Showcase - END ============

export default router;