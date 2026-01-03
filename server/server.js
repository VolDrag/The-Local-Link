// Entry point for the server
// Load environment variables FIRST before any imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Route Imports
import bookingRoutes from './routes/bookingRoutes.js'; // Anupam
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js'; // Rafi
import reviewRoutes from './routes/reviewRoutes.js'; // Anupam
import notificationRoutes from './routes/notificationRoutes.js'; // Anupam
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import adminEventRoutes from './routes/adminEventRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

//console.log('✅ Notification routes loaded:', notificationRoutes); // ADD THIS LINE

// Import models to register them with Mongoose
import './models/User.js';
import './models/Service.js';
import './models/Category.js';
import './models/Review.js';
import './models/Booking.js';
import './models/Notification.js';
import './models/Event.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS before routes
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Connect to Database
connectDB();

// Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes); // Anupam's Feature
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin/events', adminEventRoutes);
app.use('/api/reports', reportRoutes);
//console.log('✅ Notification routes registered at /api/notifications'); // ADD THIS LINE

app.get('/', (req, res) => res.send('Welcome to The Local Link'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});