import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    seeker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT' },
    status: {
      type: String,
      enum: ['initiated', 'executed', 'completed', 'failed', 'refunded'],
      default: 'initiated',
    },
    holdStatus: {
      type: String,
      enum: ['none', 'held', 'released', 'refunded'],
      default: 'none',
    },
    commissionAmount: { type: Number, default: 0 },
    providerAmount: { type: Number, default: 0 },
    bkashPaymentId: String,
    bkashTrxId: String,
    bkashUrl: String,
    payerReference: String,
    merchantInvoice: String,
    failureReason: String,
    executedAt: Date,
    completedAt: Date,
    refundedAt: Date,
    rawCallback: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

paymentSchema.index({ booking: 1 });
paymentSchema.index({ seeker: 1, createdAt: -1 });
paymentSchema.index({ bkashPaymentId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
