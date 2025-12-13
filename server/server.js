// Entry point for the server
import express from 'express';
import dotenv from 'dotenv';
<<<<<<< HEAD
=======
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';  //#Rafi#
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js'; //user profile routes
>>>>>>> cf8b3cefcc6375f1a545a7b9122044e5ab453eaa
import cors from 'cors';
import { connectDB } from './config/db.js';

// Route Imports
import bookingRoutes from './routes/bookingRoutes.js'; // Anupam
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js'; // Rafi
import reviewRoutes from './routes/reviewRoutes.js'; // Anupam

// Import models to register them with Mongoose
import './models/User.js';
import './models/Service.js';
import './models/Category.js';
import './models/Review.js';
import './models/Booking.js';
import './models/Report.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS before routes
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
<<<<<<< HEAD
app.use('/api/bookings', bookingRoutes);     // Anupam's Feature
app.use("/api/categories", categoryRoutes);  // Rafi's Feature

=======
app.use("/api/categories", categoryRoutes); //#Rafi#
app.use("/api/admin", adminRoutes);
app.use('/api/users', userRoutes); // user profile routes
>>>>>>> cf8b3cefcc6375f1a545a7b9122044e5ab453eaa
app.get('/', (req, res) => res.send('Welcome to The Local Link'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});