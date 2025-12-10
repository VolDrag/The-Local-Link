// ifty
// Entry point for the server
// App configuration and middleware setup goes here
import express from 'express';
import dotenv from 'dotenv';
//Anupam
import bookingRoutes from './routes/bookingRoutes.js';
//
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Import models to register them with Mongoose
import './models/User.js';
import './models/Service.js';
import './models/Category.js';
import './models/Review.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// CORS must be enabled BEFORE routes
app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
//Anupam
app.use('/api/bookings', bookingRoutes);

connectDB();

app.get('/', (req, res) => res.send('Welcome to The Local Link'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
