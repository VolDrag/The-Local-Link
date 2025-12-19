// Verification Helper
// Automatically verify users based on their activity
//Debashish

import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

/**
 * Check and update verification status for a user
 * Seeker: Needs 3 bookings + 3 reviews given
 * Provider: Needs 5 completed bookings + 5 reviews received
 */
export const checkAndUpdateVerification = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let shouldBeVerified = false;

    if (user.role === 'seeker') {
      // Count bookings made by seeker
      const bookingCount = await Booking.countDocuments({ seeker: userId });
      
      // Count reviews given by seeker
      const reviewCount = await Review.countDocuments({ user: userId });

      // Seeker needs at least 3 bookings AND 3 reviews
      shouldBeVerified = bookingCount >= 3 && reviewCount >= 3;
      
    } else if (user.role === 'provider') {
      // Count completed bookings as provider
      const completedBookingCount = await Booking.countDocuments({ 
        provider: userId,
        status: 'completed'
      });
      
      // Count reviews received on provider's services
      const Service = (await import('../models/Service.js')).default;
      const services = await Service.find({ provider: userId }).select('_id');
      const serviceIds = services.map(s => s._id);
      
      const reviewCount = await Review.countDocuments({
        service: { $in: serviceIds }
      });

      // Provider needs at least 5 completed bookings AND 5 reviews
      shouldBeVerified = completedBookingCount >= 5 && reviewCount >= 5;
    }

    // Update verification status if changed
    if (user.isVerified !== shouldBeVerified) {
      // Update User model
      user.isVerified = shouldBeVerified;
      await user.save();

      // Update Profile model
      await Profile.findOneAndUpdate(
        { user: userId },
        { isVerified: shouldBeVerified }
      );

      console.log(`User ${userId} verification status updated to: ${shouldBeVerified}`);
    }

    return shouldBeVerified;
  } catch (error) {
    console.error('Error checking verification status:', error);
    return false;
  }
};

export default checkAndUpdateVerification;
