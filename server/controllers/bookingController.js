// Anupam - Booking Controller
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { checkAndUpdateVerification } from '../utils/verificationHelper.js';
import { createNotification } from './notificationController.js';
import { hasSlotConflict } from '../utils/slots.js';
import { resolveServiceAmount, splitAmounts, computeCancellationFee, defaultDuration } from '../utils/money.js';
import { providerCanAcceptBookings } from './identityController.js';
import { initiateHoldPayment, releaseToProvider, refundPayment } from './paymentController.js';
import { sendSms, smsTemplates } from '../services/sms.service.js';

const formatWhen = (d) =>
  new Date(d).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' });

const nextRecurrenceDate = (from, cadence) => {
  const d = new Date(from);
  if (cadence === 'weekly') d.setDate(d.getDate() + 7);
  else if (cadence === 'biweekly') d.setDate(d.getDate() + 14);
  else if (cadence === 'monthly') d.setMonth(d.getMonth() + 1);
  else return null;
  return d;
};

const applyReferralCredit = async (seekerId) => {
  const credit = parseFloat(process.env.REFERRAL_CREDIT_BDT || '100');
  const seeker = await User.findById(seekerId);
  if (!seeker?.referredBy) return;
  const completed = await Booking.countDocuments({ seeker: seekerId, status: 'completed' });
  if (completed !== 1) return;
  await User.findByIdAndUpdate(seeker.referredBy, { $inc: { payoutBalance: credit } });
  await User.findByIdAndUpdate(seekerId, { $inc: { bookingCredit: credit } });
  await createNotification({
    recipient: seeker.referredBy,
    type: 'system',
    title: 'Referral reward',
    message: `You earned ৳${credit} because someone you referred completed their first booking.`,
    link: '/payouts',
  });
};

export const createBooking = async (req, res) => {
  try {
    const { serviceId, scheduledDate, userNotes, durationMinutes, recurrence } = req.body;

    const service = await Service.findById(serviceId).populate('provider');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.availabilityStatus === 'offline' || !service.isActive) {
      return res.status(400).json({ message: 'This service is not currently available' });
    }

    const scheduledTime = new Date(scheduledDate);
    if (Number.isNaN(scheduledTime.getTime()) || scheduledTime <= new Date()) {
      return res.status(400).json({ message: 'Please choose a future date and time' });
    }

    const duration = durationMinutes || defaultDuration();
    const conflict = await hasSlotConflict({
      providerId: service.provider._id,
      scheduledTime,
      durationMinutes: duration,
    });
    if (conflict) {
      return res.status(409).json({ message: 'That time overlaps another booking for this provider' });
    }

    const amount = resolveServiceAmount(service);
    const { commissionAmount, providerAmount } = splitAmounts(amount);

    const booking = await Booking.create({
      seeker: req.user._id,
      service: serviceId,
      provider: service.provider._id,
      scheduledTime,
      durationMinutes: duration,
      userNotes,
      status: 'pending',
      amount,
      commissionAmount,
      providerAmount,
      recurrence: recurrence || 'none',
    });
    
    await checkAndUpdateVerification(req.user._id);
    
    await createNotification({
      recipient: service.provider._id,
      sender: req.user._id,
      type: 'booking_created',
      title: 'New Booking Request',
      message: `${req.user.username || req.user.firstName || 'A seeker'} has requested a booking for "${service.title}"`,
      relatedBooking: booking._id,
      relatedService: serviceId,
      link: `/bookings/${booking._id}`
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ seeker: req.user._id })
      .populate('service', 'title category pricing')
      .populate('provider', 'name email username firstName')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate('service', 'title category pricing')
      .populate('seeker', 'name email username firstName')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'title description category pricing images')
      .populate('seeker', 'name email phone username firstName')
      .populate('provider', 'name email phone username firstName businessName identityVerification')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      booking.seeker._id.toString() !== req.user._id.toString() &&
      booking.provider._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id || req.params.bookingId)
      .populate('service')
      .populate('seeker', 'name username firstName phone')
      .populate('provider', 'name username firstName phone identityVerification bookingSuspended');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.provider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    if (status === 'confirmed') {
      const provider = await User.findById(req.user._id);
      if (!providerCanAcceptBookings(provider)) {
        return res.status(403).json({
          message: provider.bookingSuspended
            ? 'Your account is suspended pending admin review of no-shows.'
            : 'Complete identity verification before accepting bookings.',
        });
      }
      const conflict = await hasSlotConflict({
        providerId: booking.provider._id,
        scheduledTime: booking.scheduledTime,
        durationMinutes: booking.durationMinutes,
        excludeBookingId: booking._id,
      });
      if (conflict) {
        return res.status(409).json({ message: 'This slot now conflicts with another confirmed booking' });
      }
    }

    if (status === 'cancelled') {
      return cancelBookingInternal(req, res, booking, req.user._id, 'Cancelled by provider');
    }

    booking.status = status;
    if (status === 'completed') {
      booking.completedAt = Date.now();
      if (booking.paymentStatus === 'held') {
        await releaseToProvider(booking._id);
      }
      await checkAndUpdateVerification(booking.provider._id);
      await applyReferralCredit(booking.seeker._id);

      if (booking.recurrence && booking.recurrence !== 'none') {
        const nextTime = nextRecurrenceDate(booking.scheduledTime, booking.recurrence);
        if (nextTime) {
          const clash = await hasSlotConflict({
            providerId: booking.provider._id,
            scheduledTime: nextTime,
            durationMinutes: booking.durationMinutes,
          });
          if (!clash) {
            const next = await Booking.create({
              seeker: booking.seeker._id,
              service: booking.service._id,
              provider: booking.provider._id,
              scheduledTime: nextTime,
              durationMinutes: booking.durationMinutes,
              amount: booking.amount,
              commissionAmount: booking.commissionAmount,
              providerAmount: booking.providerAmount,
              recurrence: booking.recurrence,
              parentBooking: booking._id,
              status: 'pending',
            });
            await createNotification({
              recipient: booking.seeker._id,
              sender: booking.provider._id,
              type: 'system',
              title: 'Next recurring visit scheduled',
              message: `A follow-up booking was created for ${formatWhen(nextTime)}. Confirm when ready.`,
              relatedBooking: next._id,
              link: `/bookings/${next._id}`,
            });
          }
        }
      }
    }

    await booking.save();

    if (status === 'confirmed') {
      try {
        await initiateHoldPayment(booking, booking.seeker);
      } catch (payErr) {
        console.error('Payment initiate on confirm failed:', payErr.message);
      }
    }

    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = '';

    switch (status) {
      case 'confirmed':
        notificationType = 'booking_confirmed';
        notificationTitle = 'Booking Confirmed';
        notificationMessage = `Your booking for "${booking.service.title}" has been confirmed. Complete payment to hold the slot.`;
        await sendSms({
          to: booking.seeker.phone,
          message: smsTemplates.bookingConfirmed(booking.service.title, formatWhen(booking.scheduledTime)),
        });
        break;
      case 'completed':
        notificationType = 'booking_completed';
        notificationTitle = 'Booking Completed';
        notificationMessage = `Your booking for "${booking.service.title}" has been completed. Please leave a review!`;
        break;
    }

    if (notificationType) {
      await createNotification({
        recipient: booking.seeker._id,
        sender: req.user._id,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        relatedBooking: booking._id,
        relatedService: booking.service._id,
        link: `/bookings/${booking._id}`
      });
    }

    const fresh = await Booking.findById(booking._id).populate('payment').populate('service', 'title');
    res.status(200).json(fresh);
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const cancelBookingInternal = async (req, res, booking, actorId, fallbackReason) => {
  const reason = req.body.reason || fallbackReason || 'Cancelled';
  const { fee, refund, withinFreeWindow } = computeCancellationFee(booking.scheduledTime, booking.amount || 0);

  if (['held', 'released'].includes(booking.paymentStatus)) {
    await refundPayment(booking._id, { partialAmount: refund });
  }

  booking.status = 'cancelled';
  booking.cancelledBy = actorId;
  booking.cancellationReason = reason;
  booking.cancelledAt = new Date();
  booking.cancellationFee = fee;
  await booking.save();

  const other =
    booking.seeker._id.toString() === actorId.toString()
      ? booking.provider._id
      : booking.seeker._id;
  const otherUser = await User.findById(other).select('phone');

  await createNotification({
    recipient: other,
    sender: actorId,
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: `Booking for "${booking.service.title}" was cancelled. ${withinFreeWindow ? 'Full refund window.' : `Cancellation fee ৳${fee}.`}`,
    relatedBooking: booking._id,
    relatedService: booking.service._id,
    link: `/bookings/${booking._id}`,
  });

  await sendSms({
    to: otherUser?.phone,
    message: smsTemplates.bookingCancelled(booking.service.title),
  });

  return res.status(200).json(booking);
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'title')
      .populate('seeker', 'phone username')
      .populate('provider', 'phone username');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const uid = req.user._id.toString();
    if (booking.seeker._id.toString() !== uid && booking.provider._id.toString() !== uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Only pending or confirmed bookings can be cancelled' });
    }
    return cancelBookingInternal(req, res, booking, req.user._id, req.body.reason);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const flagNoShow = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const uid = req.user._id.toString();
    const isSeeker = booking.seeker.toString() === uid;
    const isProvider = booking.provider.toString() === uid;
    if (!isSeeker && !isProvider) return res.status(403).json({ message: 'Not authorized' });
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'No-show can only be flagged on a confirmed booking' });
    }
    if (booking.noShowAt) {
      return res.status(400).json({ message: 'No-show already flagged' });
    }

    const against = isSeeker ? booking.provider : booking.seeker;
    booking.noShowFlaggedBy = req.user._id;
    booking.noShowAgainst = against;
    booking.noShowAt = new Date();
    booking.status = 'cancelled';
    booking.cancelledBy = req.user._id;
    booking.cancellationReason = 'No-show';
    booking.cancelledAt = new Date();
    await booking.save();

    if (booking.paymentStatus === 'held') {
      if (isSeeker) {
        await refundPayment(booking._id);
      } else {
        await releaseToProvider(booking._id);
      }
    }

    const windowDays = parseInt(process.env.NO_SHOW_WINDOW_DAYS || '90', 10);
    const limit = parseInt(process.env.NO_SHOW_LIMIT || '3', 10);
    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
    const count = await Booking.countDocuments({
      noShowAgainst: against,
      noShowAt: { $gte: since },
    });

    if (count >= limit) {
      await User.findByIdAndUpdate(against, {
        bookingSuspended: true,
        bookingSuspendedReason: `${count} no-shows in ${windowDays} days`,
      });
    }

    await createNotification({
      recipient: against,
      sender: req.user._id,
      type: 'system',
      title: 'No-show recorded',
      message: `A no-show was flagged on a booking. ${count >= limit ? 'Account suspended pending admin review.' : `${count}/${limit} in the rolling window.`}`,
      relatedBooking: booking._id,
      link: `/bookings/${booking._id}`,
    });

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const proposeReschedule = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('service', 'title');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const uid = req.user._id.toString();
    if (booking.seeker.toString() !== uid && booking.provider.toString() !== uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Only pending or confirmed bookings can be rescheduled' });
    }
    const proposedTime = new Date(req.body.proposedTime);
    if (Number.isNaN(proposedTime.getTime()) || proposedTime <= new Date()) {
      return res.status(400).json({ message: 'Proposed time must be in the future' });
    }
    const conflict = await hasSlotConflict({
      providerId: booking.provider,
      scheduledTime: proposedTime,
      durationMinutes: booking.durationMinutes,
      excludeBookingId: booking._id,
    });
    if (conflict) {
      return res.status(409).json({ message: 'Proposed time overlaps another booking' });
    }

    booking.rescheduleProposal = {
      proposedTime,
      proposedBy: req.user._id,
      status: 'pending',
    };
    await booking.save();

    const other = booking.seeker.toString() === uid ? booking.provider : booking.seeker;
    await createNotification({
      recipient: other,
      sender: req.user._id,
      type: 'reschedule',
      title: 'Reschedule proposed',
      message: `New time proposed for "${booking.service.title}": ${formatWhen(proposedTime)}`,
      relatedBooking: booking._id,
      link: `/bookings/${booking._id}`,
    });

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const respondReschedule = async (req, res) => {
  try {
    const { accept } = req.body;
    const booking = await Booking.findById(req.params.id).populate('service', 'title');
    if (!booking?.rescheduleProposal?.proposedTime) {
      return res.status(400).json({ message: 'No pending reschedule proposal' });
    }
    const uid = req.user._id.toString();
    if (booking.seeker.toString() !== uid && booking.provider.toString() !== uid) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.rescheduleProposal.proposedBy.toString() === uid) {
      return res.status(400).json({ message: 'The other party must accept or decline' });
    }

    if (accept) {
      const conflict = await hasSlotConflict({
        providerId: booking.provider,
        scheduledTime: booking.rescheduleProposal.proposedTime,
        durationMinutes: booking.durationMinutes,
        excludeBookingId: booking._id,
      });
      if (conflict) {
        return res.status(409).json({ message: 'That slot is no longer available' });
      }
      booking.scheduledTime = booking.rescheduleProposal.proposedTime;
      booking.rescheduleProposal.status = 'accepted';
    } else {
      booking.rescheduleProposal.status = 'declined';
    }
    await booking.save();

    await createNotification({
      recipient: booking.rescheduleProposal.proposedBy,
      sender: req.user._id,
      type: 'reschedule',
      title: accept ? 'Reschedule accepted' : 'Reschedule declined',
      message: accept
        ? `The booking was moved to ${formatWhen(booking.scheduledTime)}`
        : 'The proposed new time was declined.',
      relatedBooking: booking._id,
      link: `/bookings/${booking._id}`,
    });

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const markEnRoute = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'title')
      .populate('seeker', 'phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the provider can mark en route' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be marked en route' });
    }
    booking.enRouteAt = new Date();
    await booking.save();

    await createNotification({
      recipient: booking.seeker._id,
      sender: req.user._id,
      type: 'en_route',
      title: 'Provider is on the way',
      message: `Your provider for "${booking.service.title}" is en route.`,
      relatedBooking: booking._id,
      link: `/bookings/${booking._id}`,
    });
    await sendSms({
      to: booking.seeker.phone,
      message: smsTemplates.providerEnRoute(booking.service.title),
    });

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getBookingHistory = async (req, res) => {
  try {
    const { status, startDate, endDate, serviceId } = req.query;
    const filter = { seeker: req.user._id };
    
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.scheduledTime = {};
      if (startDate) filter.scheduledTime.$gte = new Date(startDate);
      if (endDate) filter.scheduledTime.$lte = new Date(endDate);
    }
    if (serviceId) filter.service = serviceId;

    const bookings = await Booking.find(filter)
      .populate('service', 'title category pricing images')
      .populate('provider', 'name email phone username firstName')
      .sort({ scheduledTime: -1 });

    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };

    res.status(200).json({ bookings, stats });
  } catch (error) {
    console.error('Error fetching booking history:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProviderBookingHistory = async (req, res) => {
  try {
    const { status, startDate, endDate, serviceId } = req.query;
    const filter = { provider: req.user._id };
    
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.scheduledTime = {};
      if (startDate) filter.scheduledTime.$gte = new Date(startDate);
      if (endDate) filter.scheduledTime.$lte = new Date(endDate);
    }
    if (serviceId) filter.service = serviceId;

    const bookings = await Booking.find(filter)
      .populate('service', 'title category pricing images')
      .populate('seeker', 'name email phone username firstName')
      .sort({ scheduledTime: -1 });

    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.providerAmount || b.amount || b.service?.pricing || 0), 0)
    };

    res.status(200).json({ bookings, stats });
  } catch (error) {
    console.error('Error fetching provider booking history:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
