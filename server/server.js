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
import categoryRoutes from './routes/categoryRoutes.js';  //#Rafi#
import cors from 'cors';
import { connectDB } from './config/db.js';

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

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
<<<<<<< HEAD
//Anupam
app.use('/api/bookings', bookingRoutes);

connectDB();
=======
app.use("/api/categories", categoryRoutes); //#Rafi#
>>>>>>> 28a0cffee2fbf161d3ccead1bc0781767880f15e

app.get('/', (req, res) => res.send('Welcome to The Local Link'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
