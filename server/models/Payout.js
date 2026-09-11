import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'BDT' },
    method: { type: String, enum: ['bkash', 'nagad', 'manual'], default: 'manual' },
    accountNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'paid'],
      default: 'requested',
    },
    adminNote: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true }
);

payoutSchema.index({ provider: 1, createdAt: -1 });
payoutSchema.index({ status: 1 });

const Payout = mongoose.model('Payout', payoutSchema);
export default Payout;
