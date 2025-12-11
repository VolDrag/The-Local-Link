// Entry point for the server
import express from 'express';
import dotenv from 'dotenv';
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
app.use('/api/bookings', bookingRoutes);     // Anupam's Feature
app.use("/api/categories", categoryRoutes);  // Rafi's Feature

app.get('/', (req, res) => res.send('Welcome to The Local Link'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});