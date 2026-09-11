import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    replacedByHash: { type: String, default: null },
    userAgent: String,
    ip: String,
  },
  { timestamps: true }
);

refreshTokenSchema.index({ user: 1, createdAt: -1 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
