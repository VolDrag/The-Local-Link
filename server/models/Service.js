// ifty
import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a service title'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Please add a service description'],
      maxlength: 2000,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pricing: {
      type: Number,
      required: [true, 'Please add pricing information'],
      min: 0,
    },
    pricingUnit: {
      type: String,
      enum: ['hour', 'day', 'project', 'fixed'],
      default: 'fixed',
    },
    // Feature 21: Dynamic pricing - hourly, weekly, monthly, project, fixed rates
    pricingType: {
      type: String,
      enum: ['hourly', 'weekly', 'monthly', 'project', 'fixed'], // Added weekly, monthly, project
      default: 'fixed',
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },
    weeklyRate: {
      type: Number,
      min: 0,
    },
    monthlyRate: {
      type: Number,
      min: 0,
    },
    projectRate: {
      type: Number,
      min: 0,
    },
    fixedRate: {
      type: Number,
      min: 0,
    },//finish feature 21
    images: [
      {
        type: String,
      },
    ],
    location: {
      city: {
        type: String,
        required: [true, 'Please add a city'],
        trim: true,
      },
      area: {
        type: String,
        required: [true, 'Please add an area'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Please add a country'],
        trim: true,
      },
    },
    // Denormalized rating fields (updated by Review hooks)
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    // Provider's availability status     //*################Rafi##############(feature 16)
    availabilityStatus: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
    },


    
    // Special offers
    hasOffer: {
      type: Boolean,
      default: false,
    },
    offerDescription: {
      type: String,
      maxlength: 200,
    },
    offerExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Text indexes for search functionality
serviceSchema.index({ title: 'text', description: 'text' });

// Indexes for filtering and sorting
serviceSchema.index({ category: 1 });
serviceSchema.index({ 'location.city': 1, 'location.area': 1, 'location.country': 1 });
serviceSchema.index({ averageRating: -1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ provider: 1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
