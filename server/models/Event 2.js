import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
    },
    discount: {
      type: String,
      trim: true,
      maxlength: [50, 'Discount info cannot exceed 50 characters'],
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    targetAudience: {
      type: String,
      enum: ['all', 'seeker', 'provider'],
      default: 'all',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    color: {
      type: String,
      default: '#4F46E5', // Default indigo color
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
eventSchema.index({ isActive: 1, targetAudience: 1, startDate: -1 });
eventSchema.index({ endDate: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
