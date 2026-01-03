// Feature 20: Favorite Services Routes
// All routes require authentication
// #ifty
import express from 'express';
import {
  getFavorites,
  toggleFavorite,
  checkFavorite,
  addFavorite,
  removeFavorite,
  getFavoritesCount
} from '../controllers/favoritesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all favorites
router.get('/', getFavorites);

// Get favorites count
router.get('/count', getFavoritesCount);

// Check if service is favorite
router.get('/check/:serviceId', checkFavorite);

// Toggle favorite status (recommended - single endpoint for add/remove)
router.put('/:serviceId', toggleFavorite);

// Add to favorites
router.post('/:serviceId', addFavorite);

// Remove from favorites
router.delete('/:serviceId', removeFavorite);

export default router;
