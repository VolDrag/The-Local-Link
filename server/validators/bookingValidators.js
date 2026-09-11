import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1, 'Service is required'),
    scheduledDate: z.string().min(1, 'Scheduled date is required'),
    userNotes: z.string().max(500).optional().or(z.literal('')),
    durationMinutes: z.coerce.number().int().min(30).max(8 * 60).optional(),
    recurrence: z.enum(['none', 'weekly', 'biweekly', 'monthly']).optional(),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().trim().min(3).max(500),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const rescheduleSchema = z.object({
  body: z.object({
    proposedTime: z.string().min(1),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const reviewCreateSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1),
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().min(3).max(500),
  }),
});

export const disputeSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1),
    reason: z.string().trim().min(3).max(200),
    details: z.string().trim().min(10).max(2000),
  }),
});

export const messageSchema = z.object({
  body: z.object({
    body: z.string().trim().min(1).max(2000),
  }),
});

export const payoutRequestSchema = z.object({
  body: z.object({
    amount: z.coerce.number().min(1),
    method: z.enum(['bkash', 'nagad', 'manual']).optional(),
    accountNumber: z.string().trim().min(8).max(20),
  }),
});
