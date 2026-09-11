import Payout from '../models/Payout.js';
import User from '../models/User.js';
import { writeAudit } from '../utils/audit.js';

export const requestPayout = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can request payouts' });
    }
    const { amount, method = 'manual', accountNumber } = req.body;
    const user = await User.findById(req.user._id);
    if (amount > (user.payoutBalance || 0)) {
      return res.status(400).json({ message: 'Amount exceeds available payout balance' });
    }

    const pending = await Payout.findOne({ provider: user._id, status: 'requested' });
    if (pending) {
      return res.status(400).json({ message: 'You already have a payout request pending review' });
    }

    const payout = await Payout.create({
      provider: user._id,
      amount,
      method,
      accountNumber,
    });

    res.status(201).json(payout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to request payout' });
  }
};

export const getMyPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find({ provider: req.user._id }).sort({ createdAt: -1 });
    const user = await User.findById(req.user._id).select('payoutBalance');
    res.json({ payouts, payoutBalance: user?.payoutBalance || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load payouts' });
  }
};

export const getAllPayouts = async (req, res) => {
  try {
    const payouts = await Payout.find()
      .populate('provider', 'username email businessName phone payoutBalance')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payouts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load payouts' });
  }
};

export const reviewPayout = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected', 'paid'].includes(status)) {
      return res.status(400).json({ message: 'Invalid payout status' });
    }

    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ message: 'Payout not found' });

    if (status === 'approved' || status === 'paid') {
      const provider = await User.findById(payout.provider);
      if ((provider.payoutBalance || 0) < payout.amount) {
        return res.status(400).json({ message: 'Provider balance is no longer sufficient' });
      }
      provider.payoutBalance = Math.round((provider.payoutBalance - payout.amount) * 100) / 100;
      await provider.save();
      payout.status = status === 'paid' ? 'paid' : 'paid';
    } else {
      payout.status = 'rejected';
    }

    payout.adminNote = adminNote;
    payout.reviewedBy = req.user._id;
    payout.reviewedAt = new Date();
    await payout.save();

    await writeAudit({
      admin: req.user,
      action: `payout_${payout.status}`,
      targetType: 'payout',
      targetId: payout._id,
      details: { amount: payout.amount, adminNote },
      req,
    });

    res.json(payout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to review payout' });
  }
};
