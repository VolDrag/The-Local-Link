import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import { createNotification } from './notificationController.js';

const assertParty = (booking, user) => {
  const uid = user._id.toString();
  return (
    booking.seeker.toString() === uid ||
    booking.provider.toString() === uid ||
    user.role === 'admin'
  );
};

export const getMessages = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!assertParty(booking, req.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.find({ booking: booking._id })
      .populate('sender', 'username firstName role')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { booking: booking._id, sender: { $ne: req.user._id }, readAt: null },
      { readAt: new Date() }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load messages' });
  }
};

export const postMessage = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!assertParty(booking, req.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (['cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot message a cancelled booking' });
    }

    const message = await Message.create({
      booking: booking._id,
      sender: req.user._id,
      body: req.body.body,
    });

    const recipient =
      booking.seeker.toString() === req.user._id.toString()
        ? booking.provider
        : booking.seeker;

    await createNotification({
      recipient,
      sender: req.user._id,
      type: 'system',
      title: 'New booking message',
      message: req.body.body.slice(0, 80),
      relatedBooking: booking._id,
      link: `/bookings/${booking._id}`,
    });

    const populated = await message.populate('sender', 'username firstName role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};
