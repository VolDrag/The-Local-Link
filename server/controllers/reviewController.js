// ifty
import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';

// @desc    Create a review
// @route   POST /api/bookings/:bookingId/review
// @access  Private
const createReview = async (req, res) => {
  // TODO: Implement create review
};

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

// @desc    Respond to a review (Provider only)
// @route   PUT /api/reviews/:id/response
// @access  Private (Provider only)
const respondToReview = async (req, res) => {
  // TODO: Implement respond to review
};

export {
  createReview,
  getServiceReviews,
  respondToReview,
};
