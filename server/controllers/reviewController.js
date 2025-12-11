// ifty
import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';

// @desc    Create a review
// @route   POST /api/services/:serviceId/reviews
// @access  Private (Only users who completed a booking)
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { serviceId } = req.params;
  const userId = req.user._id;

  // Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  // Check if user has a completed booking for this service
  const completedBooking = await Booking.findOne({
    user: userId,
    service: serviceId,
    status: 'completed'
  });

  if (!completedBooking) {
    res.status(403);
    throw new Error('You can only review services you have completed');
  }

  // Check if user already reviewed this service
  const existingReview = await Review.findOne({
    user: userId,
    service: serviceId
  });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this service');
  }

  // Create review
  const review = await Review.create({
    user: userId,
    service: serviceId,
    rating,
    comment
  });

  // Populate user info
  await review.populate('user', 'name avatar');

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Get reviews for a service
// @route   GET /api/services/:serviceId/reviews
// @access  Public
const getServiceReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const reviews = await Review.find({
    service: req.params.serviceId,
    isApproved: true,
  })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const totalReviews = await Review.countDocuments({
    service: req.params.serviceId,
    isApproved: true,
  });

  const totalPages = Math.ceil(totalReviews / limitNum);

  res.json({
    reviews,
    currentPage: pageNum,
    totalPages,
    totalReviews,
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Review owner only)
const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns the review
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only update your own reviews');
  }

  // Update review
  review.rating = rating || review.rating;
  review.comment = comment || review.comment;

  await review.save();
  await review.populate('user', 'name avatar');

  res.json({
    success: true,
    data: review
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Review owner or admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  await review.deleteOne();

  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate('service', 'title images')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Check if user can review a service
// @route   GET /api/services/:serviceId/can-review
// @access  Private
const canReviewService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const userId = req.user._id;

  // Check if user has completed booking
  const completedBooking = await Booking.findOne({
    user: userId,
    service: serviceId,
    status: 'completed'
  });

  // Check if user already reviewed
  const existingReview = await Review.findOne({
    user: userId,
    service: serviceId
  });

  res.json({
    canReview: !!completedBooking && !existingReview,
    hasBooking: !!completedBooking,
    hasReview: !!existingReview
  });
});

// @desc    Respond to a review (Provider only)
// @route   PUT /api/reviews/:id/response
// @access  Private (Provider only)
const respondToReview = async (req, res) => {
  // TODO: Implement respond to review (optional feature for later)
};

export {
  createReview,
  getServiceReviews,
  updateReview,
  deleteReview,
  getMyReviews,
  canReviewService,
  respondToReview,
};