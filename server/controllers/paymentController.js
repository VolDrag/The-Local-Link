import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { createBkashPayment, executeBkashPayment } from '../services/bkash.service.js';
import { resolveServiceAmount, splitAmounts } from '../utils/money.js';
import { createNotification } from './notificationController.js';

const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:3000';

export const initiateHoldPayment = async (booking, reqUser) => {
  const existing = await Payment.findOne({
    booking: booking._id,
    status: { $in: ['initiated', 'executed', 'completed'] },
  });
  if (existing && existing.status !== 'initiated') {
    return existing;
  }
  if (existing && existing.status === 'initiated' && existing.bkashUrl) {
    return existing;
  }

  const amount = booking.amount || resolveServiceAmount(booking.service);
  const { commissionAmount, providerAmount } = splitAmounts(amount);
  const invoice = `TLL-${booking._id.toString().slice(-8)}-${Date.now()}`;
  const callbackURL = process.env.BKASH_CALLBACK_URL || `${process.env.CLIENT_URL}/payments/callback`;

  const bkash = await createBkashPayment({
    amount,
    invoice,
    payerReference: reqUser?.phone || reqUser?.email || 'seeker',
    callbackURL,
  });

  const payment = existing || new Payment({ booking: booking._id });
  payment.seeker = booking.seeker._id || booking.seeker;
  payment.provider = booking.provider._id || booking.provider;
  payment.amount = amount;
  payment.commissionAmount = commissionAmount;
  payment.providerAmount = providerAmount;
  payment.status = 'initiated';
  payment.bkashPaymentId = bkash.paymentID;
  payment.bkashUrl = bkash.bkashURL;
  payment.merchantInvoice = invoice;
  payment.payerReference = reqUser?.phone || '';
  await payment.save();

  booking.payment = payment._id;
  booking.paymentStatus = 'pending';
  booking.amount = amount;
  booking.commissionAmount = commissionAmount;
  booking.providerAmount = providerAmount;
  await booking.save();

  return payment;
};

export const executeAndHold = async (bkashPaymentId) => {
  const payment = await Payment.findOne({ bkashPaymentId });
  if (!payment) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }
  if (payment.status === 'executed' || payment.status === 'completed') {
    return payment;
  }

  const result = await executeBkashPayment(bkashPaymentId);
  const ok =
    result.statusCode === '0000' ||
    result.transactionStatus === 'Completed' ||
    result.mock === true;

  if (!ok) {
    payment.status = 'failed';
    payment.failureReason = result.statusMessage || 'Execute failed';
    payment.rawCallback = result;
    await payment.save();
    await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'failed' });
    return payment;
  }

  payment.status = 'executed';
  payment.holdStatus = 'held';
  payment.bkashTrxId = result.trxID || result.trxId || payment.bkashTrxId;
  payment.executedAt = new Date();
  payment.rawCallback = result;
  await payment.save();

  await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'held' });
  return payment;
};

export const releaseToProvider = async (bookingId) => {
  const payment = await Payment.findOne({ booking: bookingId, holdStatus: 'held' });
  if (!payment) return null;

  payment.holdStatus = 'released';
  payment.status = 'completed';
  payment.completedAt = new Date();
  await payment.save();

  await User.findByIdAndUpdate(payment.provider, {
    $inc: { payoutBalance: payment.providerAmount },
  });
  await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'released' });
  return payment;
};

export const refundPayment = async (bookingId, { partialAmount } = {}) => {
  const payment = await Payment.findOne({
    booking: bookingId,
    status: { $in: ['executed', 'completed'] },
  });
  if (!payment) return null;
  if (payment.holdStatus === 'refunded') return payment;

  const refundAmount = typeof partialAmount === 'number' ? partialAmount : payment.amount;

  if (payment.holdStatus === 'released') {
    await User.findByIdAndUpdate(payment.provider, {
      $inc: { payoutBalance: -Math.min(payment.providerAmount, refundAmount) },
    });
  }

  payment.holdStatus = 'refunded';
  payment.status = 'refunded';
  payment.refundedAt = new Date();
  await payment.save();
  await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'refunded' });
  return payment;
};

export const createPaymentForBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId || req.body.bookingId)
      .populate('service')
      .populate('seeker', 'phone email username')
      .populate('provider', 'username');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.seeker._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the seeker can pay for this booking' });
    }
    if (!['confirmed', 'pending'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking is not payable in its current status' });
    }

    const payment = await initiateHoldPayment(booking, req.user);
    res.json({
      payment,
      redirectUrl: payment.bkashUrl,
      mock: String(payment.bkashPaymentId || '').startsWith('mock_'),
    });
  } catch (error) {
    console.error('createPaymentForBooking', error);
    res.status(500).json({ message: error.message || 'Failed to start payment' });
  }
};

export const executePayment = async (req, res) => {
  try {
    const paymentID = req.body.paymentID || req.query.paymentID;
    if (!paymentID) return res.status(400).json({ message: 'paymentID is required' });
    const payment = await executeAndHold(paymentID);
    if (payment.status === 'executed') {
      await createNotification({
        recipient: payment.provider,
        sender: payment.seeker,
        type: 'system',
        title: 'Payment held',
        message: `Seeker paid ৳${payment.amount}. Funds are held until the booking is completed.`,
        relatedBooking: payment.booking,
        link: `/bookings/${payment.booking}`,
      });
    }
    res.json({ payment, success: payment.status === 'executed' });
  } catch (error) {
    console.error('executePayment', error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Execute failed' });
  }
};

export const bkashCallback = async (req, res) => {
  try {
    const paymentID = req.query.paymentID || req.body.paymentID;
    const status = req.query.status || req.body.status;
    if (status === 'success' && paymentID) {
      await executeAndHold(paymentID);
    }
    res.redirect(`${clientUrl()}/payments/result?paymentID=${encodeURIComponent(paymentID || '')}&status=${encodeURIComponent(status || '')}`);
  } catch (error) {
    res.redirect(`${clientUrl()}/payments/result?status=failed`);
  }
};

export const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('seeker', 'username email')
      .populate('provider', 'username businessName');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    const uid = req.user._id.toString();
    if (
      payment.seeker._id.toString() !== uid &&
      payment.provider._id.toString() !== uid &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load payment' });
  }
};
