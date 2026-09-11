import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, trim: true },
    targetType: {
      type: String,
      enum: ['category', 'event', 'report', 'provider_verification', 'payout', 'dispute', 'user', 'service', 'other'],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ admin: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
