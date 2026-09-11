// Anupam - Booking model schema
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  seeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  durationMinutes: {
    type: Number,
    default: 60,
    min: 30
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  userNotes: {
    type: String,
    maxlength: 500
  },
  completedAt: {
    type: Date,
    default: null
  },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancellationReason: { type: String, maxlength: 500 },
  cancelledAt: Date,
  cancellationFee: { type: Number, default: 0 },
  noShowFlaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  noShowAt: Date,
  noShowAgainst: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rescheduleProposal: {
    proposedTime: Date,
    proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'] },
  },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  paymentStatus: {
    type: String,
    enum: ['none', 'pending', 'held', 'released', 'refunded', 'failed'],
    default: 'none'
  },
  amount: { type: Number, default: 0 },
  commissionAmount: { type: Number, default: 0 },
  providerAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'BDT' },
  enRouteAt: Date,
  recurrence: {
    type: String,
    enum: ['none', 'weekly', 'biweekly', 'monthly'],
    default: 'none'
  },
  parentBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
}, { timestamps: true });

bookingSchema.index({ provider: 1, scheduledTime: 1, status: 1 });
bookingSchema.index({ seeker: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
