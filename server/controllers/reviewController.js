// Review Controller
// Teammate 4: Implement review and rating logic

// @desc    Create a review
// @route   POST /api/bookings/:bookingId/review
// @access  Private
const createReview = async (req, res) => {
  // TODO: Implement create review
};

// @desc    Get reviews for a service
// @route   GET /api/services/:serviceId/reviews
// @access  Public
const getServiceReviews = async (req, res) => {
  // TODO: Implement get service reviews
};

// @desc    Respond to a review (Provider only)
// @route   PUT /api/reviews/:id/response
// @access  Private (Provider only)
const respondToReview = async (req, res) => {
  // TODO: Implement respond to review
};

module.exports = {
  createReview,
  getServiceReviews,
  respondToReview,
};
