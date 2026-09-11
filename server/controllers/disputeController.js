import Dispute from '../models/Dispute.js';
import Booking from '../models/Booking.js';
import { writeAudit } from '../utils/audit.js';
import { refundPayment, releaseToProvider } from './paymentController.js';
import { createNotification } from './notificationController.js';

export const createDispute = async (req, res) => {
  try {
    const { bookingId, reason, details } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const uid = req.user._id.toString();
    const isParty =
      booking.seeker.toString() === uid || booking.provider.toString() === uid;
    if (!isParty) return res.status(403).json({ message: 'Not a party to this booking' });

    const existing = await Dispute.findOne({
      booking: bookingId,
      status: { $in: ['open', 'under_review'] },
    });
    if (existing) {
      return res.status(400).json({ message: 'An open dispute already exists for this booking' });
    }

    const against =
      booking.seeker.toString() === uid ? booking.provider : booking.seeker;
    const evidence = (req.files || []).map((f) => `/uploads/evidence/${f.filename}`);

    const dispute = await Dispute.create({
      booking: bookingId,
      raisedBy: req.user._id,
      against,
      reason,
      details,
      evidence,
    });

    await createNotification({
      recipient: against,
      sender: req.user._id,
      type: 'system',
      title: 'Booking dispute opened',
      message: `A dispute was opened on a booking: ${reason}`,
      relatedBooking: booking._id,
      link: `/bookings/${booking._id}`,
    });

    res.status(201).json(dispute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create dispute' });
  }
};

export const getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({
      $or: [{ raisedBy: req.user._id }, { against: req.user._id }],
    })
      .populate('booking')
      .populate('raisedBy', 'username')
      .populate('against', 'username')
      .sort({ createdAt: -1 });
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load disputes' });
  }
};

export const getAllDisputes = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const disputes = await Dispute.find(filter)
      .populate('booking')
      .populate('raisedBy', 'username email')
      .populate('against', 'username email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: disputes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load disputes' });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const { resolution, adminNote, status = 'resolved' } = req.body;
    if (!['refund', 'release_payout', 'no_action'].includes(resolution)) {
      return res.status(400).json({ message: 'Invalid resolution action' });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    if (resolution === 'refund') {
      await refundPayment(dispute.booking);
    } else if (resolution === 'release_payout') {
      await releaseToProvider(dispute.booking);
    }

    dispute.status = status === 'under_review' ? 'under_review' : 'resolved';
    dispute.resolution = resolution;
    dispute.adminNote = adminNote;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    await writeAudit({
      admin: req.user,
      action: `dispute_${resolution}`,
      targetType: 'dispute',
      targetId: dispute._id,
      details: { adminNote },
      req,
    });

    for (const uid of [dispute.raisedBy, dispute.against]) {
      await createNotification({
        recipient: uid,
        sender: req.user._id,
        type: 'system',
        title: 'Dispute resolved',
        message: `Admin resolved the dispute with action: ${resolution.replace('_', ' ')}.`,
        relatedBooking: dispute.booking,
        link: `/bookings/${dispute.booking}`,
      });
    }

    res.json(dispute);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to resolve dispute' });
  }
};
