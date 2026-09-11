import { z } from 'zod';

const email = z.string().email('Please provide a valid email address');

export const registerSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3).max(30),
    email,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character'),
    firstName: z.string().trim().min(2).max(50),
    lastName: z.string().trim().max(50).optional().or(z.literal('')),
    phone: z.string().regex(/^\+880\d{10}$/, 'Phone number must start with +880 and be followed by exactly 10 digits'),
    location: z.string().trim().min(2),
    role: z.enum(['seeker', 'provider']),
    businessName: z.string().trim().optional().or(z.literal('')),
    referralCode: z.string().trim().optional().or(z.literal('')),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    code: z.string().min(4).max(8),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    code: z.string().min(4).max(8),
    newPassword: z
      .string()
      .min(8)
      .regex(/\d/)
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/),
  }),
});
