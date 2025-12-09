// ifty
import mongoose from 'mongoose';
import Service from './Service.js';

const reviewSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      maxlength: 500,
    },
    // Admin moderation
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews (one review per user per service)
reviewSchema.index({ service: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (serviceId) {
  const stats = await this.aggregate([
    {
      $match: { service: serviceId, isApproved: true },
    },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await Service.findByIdAndUpdate(serviceId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: stats[0].totalReviews,
      });
    } else {
      // No reviews, reset to defaults
      await Service.findByIdAndUpdate(serviceId, {
        averageRating: 0,
        totalReviews: 0,
      });
    }
  } catch (error) {
    console.error('Error updating service rating:', error);
  }
};

// Update service ratings after saving a review
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.service);
});

// Update service ratings after removing a review
reviewSchema.post('remove', async function () {
  await this.constructor.calculateAverageRating(this.service);
});

// Update service ratings after deleting a review
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.service);
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
