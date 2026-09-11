import User from '../models/User.js';
import { writeAudit } from '../utils/audit.js';
import { createNotification } from './notificationController.js';

export const submitIdentity = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers submit identity documents' });
    }
    const { documentType = 'nid' } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a government ID or trade license' });
    }

    const user = await User.findById(req.user._id);
    user.identityVerification = {
      status: 'pending',
      documentType,
      documentUrl: `/uploads/identity/${req.file.filename}`,
      submittedAt: new Date(),
      reviewedAt: undefined,
      reviewedBy: undefined,
      rejectionReason: undefined,
    };
    await user.save();

    res.json({
      message: 'Identity document submitted. An admin will review it shortly.',
      identityVerification: user.identityVerification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to submit identity document' });
  }
};

export const getMyIdentity = async (req, res) => {
  res.json(req.user.identityVerification || { status: 'unsubmitted' });
};

export const getPendingProviders = async (req, res) => {
  try {
    const providers = await User.find({
      role: 'provider',
      'identityVerification.status': { $in: ['pending', 'rejected', 'unsubmitted'] },
    })
      .select('username email businessName phone identityVerification createdAt')
      .sort({ 'identityVerification.submittedAt': -1 });

    const pending = await User.find({
      role: 'provider',
      'identityVerification.status': 'pending',
    }).select('username email businessName phone identityVerification createdAt');

    res.json({ success: true, data: pending, all: providers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load verification queue' });
  }
};

export const reviewIdentity = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    if (status === 'rejected' && !reason) {
      return res.status(400).json({ message: 'A reason is required when rejecting' });
    }

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }

    user.identityVerification = {
      ...(user.identityVerification?.toObject?.() || user.identityVerification || {}),
      status,
      reviewedAt: new Date(),
      reviewedBy: req.user._id,
      rejectionReason: status === 'rejected' ? reason : undefined,
    };
    await user.save();

    await writeAudit({
      admin: req.user,
      action: `identity_${status}`,
      targetType: 'provider_verification',
      targetId: user._id,
      details: { reason },
      req,
    });

    await createNotification({
      recipient: user._id,
      sender: req.user._id,
      type: 'system',
      title: status === 'approved' ? 'Identity verified' : 'Identity verification rejected',
      message:
        status === 'approved'
          ? 'Your identity documents were approved. You can now accept bookings.'
          : `Your identity documents were rejected: ${reason}`,
      link: '/verification',
    });

    res.json({ success: true, identityVerification: user.identityVerification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to review identity' });
  }
};

export const providerCanAcceptBookings = (user) => {
  if (!user) return false;
  if (user.bookingSuspended) return false;
  if (process.env.IDENTITY_GATE === 'false') return true;
  return user.identityVerification?.status === 'approved';
};
