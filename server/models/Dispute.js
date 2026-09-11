import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    against: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, maxlength: 200 },
    details: { type: String, required: true, maxlength: 2000 },
    evidence: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved'],
      default: 'open',
    },
    resolution: {
      type: String,
      enum: ['refund', 'release_payout', 'no_action', null],
      default: null,
    },
    adminNote: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true }
);

disputeSchema.index({ booking: 1 });
disputeSchema.index({ status: 1, createdAt: -1 });

const Dispute = mongoose.model('Dispute', disputeSchema);
export default Dispute;
