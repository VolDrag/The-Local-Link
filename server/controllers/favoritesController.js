// Feature 20: Favorite Services (Wishlist) Controller
// Uses a separate Favorites collection for reliability
// ifty
import asyncHandler from 'express-async-handler';
import Favorite from '../models/Favorite.js';
import Service from '../models/Service.js';

// @desc    Get user's favorite services
// @route   GET /api/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all favorites for this user
  const favorites = await Favorite.find({ user: userId })
    .populate({
      path: 'service',
      match: { isActive: true },
      populate: [
        { path: 'category', select: 'name icon' },
        { path: 'provider', select: 'name username businessName avatar isVerified' }
      ]
    })
    .sort({ createdAt: -1 });

  // Filter out any null services (deleted or inactive)
  const validFavorites = favorites
    .filter(fav => fav.service !== null)
    .map(fav => fav.service);

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
  const userId = req.user._id;

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

  // Check if already favorited
  const existingFavorite = await Favorite.findOne({
    user: userId,
    service: serviceId
  });

  let isFavorite;

  if (existingFavorite) {
    // Remove from favorites
    await Favorite.deleteOne({ _id: existingFavorite._id });
    isFavorite = false;
  } else {
    // Add to favorites
    await Favorite.create({
      user: userId,
      service: serviceId
    });
    isFavorite = true;
  }

  // Get updated count
  const count = await Favorite.countDocuments({ user: userId });

  res.json({
    success: true,
    isFavorite,
    message: isFavorite ? 'Added to favorites' : 'Removed from favorites',
    favoritesCount: count
  });
});

// @desc    Check if service is in favorites
// @route   GET /api/favorites/check/:serviceId
// @access  Private
const checkFavorite = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const userId = req.user._id;

  const favorite = await Favorite.findOne({
    user: userId,
    service: serviceId
  });

  res.json({
    success: true,
    isFavorite: !!favorite
  });
});

// @desc    Add service to favorites
// @route   POST /api/favorites/:serviceId
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const userId = req.user._id;

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

  // Check if already favorited
  const existingFavorite = await Favorite.findOne({
    user: userId,
    service: serviceId
  });

  if (existingFavorite) {
    return res.json({
      success: true,
      message: 'Service is already in favorites',
      isFavorite: true
    });
  }

  // Add to favorites
  await Favorite.create({
    user: userId,
    service: serviceId
  });

  const count = await Favorite.countDocuments({ user: userId });

  res.status(201).json({
    success: true,
    message: 'Added to favorites',
    isFavorite: true,
    favoritesCount: count
  });
});

// @desc    Remove service from favorites
// @route   DELETE /api/favorites/:serviceId
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const userId = req.user._id;

  const result = await Favorite.deleteOne({
    user: userId,
    service: serviceId
  });

  if (result.deletedCount === 0) {
    return res.json({
      success: true,
      message: 'Service was not in favorites',
      isFavorite: false
    });
  }

  const count = await Favorite.countDocuments({ user: userId });

  res.json({
    success: true,
    message: 'Removed from favorites',
    isFavorite: false,
    favoritesCount: count
  });
});

// @desc    Get favorites count for current user
// @route   GET /api/favorites/count
// @access  Private
const getFavoritesCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const count = await Favorite.countDocuments({ user: userId });

  res.json({
    success: true,
    count
  });
});

export {
  getFavorites,
  toggleFavorite,
  checkFavorite,
  addFavorite,
  removeFavorite,
  getFavoritesCount
};
