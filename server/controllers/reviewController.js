// Review Controller
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import { checkAndUpdateVerification } from '../utils/verificationHelper.js'; //Debashish


// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { serviceId, rating, comment } = req.body;

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user has a completed booking for this service
    const hasBooking = await Booking.findOne({
      seeker: req.user._id,
      service: serviceId,
      status: 'completed'
    });

    if (!hasBooking) {
      return res.status(403).json({ 
        message: 'You can only review services you have used' 
      });
    }

    // Check if user already reviewed this service
    const existingReview = await Review.findOne({
      user: req.user._id,
      service: serviceId
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this service' 
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user._id,
      service: serviceId,
      rating,
      comment
    });

    // Populate user info
    await review.populate('user', 'name avatar');

    // Check reviewer (seeker) verification
    //Debashish
    await checkAndUpdateVerification(req.user._id); // Check reviewer (seeker) verification
    // Also check provider verification
    await checkAndUpdateVerification(service.provider); // Check provider verification

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Get reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
export const getServiceReviews = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Respond to a review (Provider only)
// @route   PUT /api/reviews/:id/response
// @access  Private (Provider only)
export const respondToReview = async (req, res) => {
  try {
    const { response } = req.body;

    const review = await Review.findById(req.params.id).populate('service');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the service provider
    if (review.service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Only the service provider can respond to reviews' 
      });
    }

    review.providerResponse = response;
    review.responseDate = Date.now();
    await review.save();

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};