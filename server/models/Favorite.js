// Feature 20: Favorite Model - Separate collection for favorites
// This approach is more reliable than embedding favorites in User document
// ifty
import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only favorite a service once
favoriteSchema.index({ user: 1, service: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
