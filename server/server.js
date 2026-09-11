import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { generalLimiter } from './middleware/rateLimiter.js';

import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import adminEventRoutes from './routes/adminEventRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import favoritesRoutes from './routes/favoritesRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
import identityRoutes from './routes/identityRoutes.js';

import './models/User.js';
import './models/Service.js';
import './models/Category.js';
import './models/Review.js';
import './models/Booking.js';
import './models/Notification.js';
import './models/Event.js';
import './models/Payment.js';
import './models/Payout.js';
import './models/Dispute.js';
import './models/Message.js';
import './models/AuditLog.js';
import './models/RefreshToken.js';

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(generalLimiter);

app.use('/uploads', express.static('uploads'));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin/events', adminEventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/identity', identityRoutes);

app.get('/', (req, res) => res.send('Welcome to The Local Link'));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
