// Feature 20: Favorite Services (Wishlist) Controller
// Allows all authenticated users to save/manage favorite services
// #ifty
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Service from '../models/Service.js';

// @desc    Get user's favorite services
// @route   GET /api/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'favorites',
      match: { isActive: true }, // Only return active services
      populate: [
        { path: 'category', select: 'name icon' },
        { path: 'provider', select: 'name businessName avatar isVerified' }
      ]
    });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Filter out any null references (in case a service was deleted)
  const validFavorites = user.favorites.filter(fav => fav !== null);

  res.json({
    success: true,
    count: validFavorites.length,
    favorites: validFavorites
  });
});

// @desc    Toggle favorite status (add if not exists, remove if exists)
// @route   PUT /api/favorites/:serviceId
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  // Check if service exists and is active
  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  if (!service.isActive) {
    res.status(400);
    throw new Error('This service is no longer available');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Initialize favorites array if it doesn't exist
  if (!user.favorites) {
    user.favorites = [];
  }

  const favoriteIndex = user.favorites.findIndex(
    fav => fav.toString() === serviceId
  );
  
  let isFavorite;
  if (favoriteIndex === -1) {
    // Add to favorites
    user.favorites.push(serviceId);
    isFavorite = true;
  } else {
    // Remove from favorites
    user.favorites.splice(favoriteIndex, 1);
    isFavorite = false;
  }

  await user.save();

  res.json({
    success: true,
    isFavorite,
    message: isFavorite ? 'Added to favorites' : 'Removed from favorites',
    favoritesCount: user.favorites.length
  });
});

// @desc    Check if service is in favorites
// @route   GET /api/favorites/check/:serviceId
// @access  Private
const checkFavorite = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isFavorite = user.favorites && user.favorites.some(
    fav => fav.toString() === serviceId
  );

  res.json({
    success: true,
    isFavorite
  });
});

// @desc    Add service to favorites
// @route   POST /api/favorites/:serviceId
// @access  Private
const addToFavorites = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  // Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  if (!service.isActive) {
    res.status(400);
    throw new Error('This service is no longer available');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Initialize favorites array if it doesn't exist
  if (!user.favorites) {
    user.favorites = [];
  }

  // Check if already in favorites
  if (user.favorites.some(fav => fav.toString() === serviceId)) {
    res.status(400);
    throw new Error('Service already in favorites');
  }

  user.favorites.push(serviceId);
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Service added to favorites',
    favoritesCount: user.favorites.length
  });
});

// @desc    Remove service from favorites
// @route   DELETE /api/favorites/:serviceId
// @access  Private
const removeFromFavorites = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const favoriteIndex = user.favorites.findIndex(
    fav => fav.toString() === serviceId
  );

  if (favoriteIndex === -1) {
    res.status(400);
    throw new Error('Service not in favorites');
  }

  user.favorites.splice(favoriteIndex, 1);
  await user.save();

  res.json({
    success: true,
    message: 'Service removed from favorites',
    favoritesCount: user.favorites.length
  });
});

export {
  getFavorites,
  toggleFavorite,
  checkFavorite,
  addToFavorites,
  removeFromFavorites
};
