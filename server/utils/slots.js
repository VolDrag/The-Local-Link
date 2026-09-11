import Booking from '../models/Booking.js';
import { defaultDuration } from './money.js';

export const windowsOverlap = (startA, durationA, startB, durationB) => {
  const aStart = new Date(startA).getTime();
  const aEnd = aStart + durationA * 60 * 1000;
  const bStart = new Date(startB).getTime();
  const bEnd = bStart + durationB * 60 * 1000;
  return aStart < bEnd && bStart < aEnd;
};

export const hasSlotConflict = async ({ providerId, scheduledTime, durationMinutes, excludeBookingId }) => {
  const duration = durationMinutes || defaultDuration();
  const start = new Date(scheduledTime);
  const windowStart = new Date(start.getTime() - 12 * 60 * 60 * 1000);
  const windowEnd = new Date(start.getTime() + 12 * 60 * 60 * 1000);

  const query = {
    provider: providerId,
    status: { $in: ['pending', 'confirmed'] },
    scheduledTime: { $gte: windowStart, $lte: windowEnd },
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const existing = await Booking.find(query).select('scheduledTime durationMinutes');
  return existing.some((b) =>
    windowsOverlap(start, duration, b.scheduledTime, b.durationMinutes || defaultDuration())
  );
};
