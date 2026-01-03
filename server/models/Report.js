// Report model schema
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportedService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    reason: {
      type: String,
      required: true,
      maxlength: 100,
    },
    details: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending_review', 'resolved'],
      default: 'pending_review',
    },
    adminResponse: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
