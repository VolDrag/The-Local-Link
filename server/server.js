// ifty
// Entry point for the server
// App configuration and middleware setup goes here
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import cors from 'cors';
import { connectDB } from './config/db.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);

connectDB();

app.use(cors());

app.get('/', (req, res) => res.send('Welcome to The Local Link'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
