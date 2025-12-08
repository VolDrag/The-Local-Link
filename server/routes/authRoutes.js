// Authentication routes
// /api/auth

import express from 'express';
import User from '../models/User.js';
// import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

//Register new user
router.post('/register', async (req, res) => {
    const {username , email, password, firstName, lastName, phone, location, role, businessName} = req.body;
    try {
        if (!username || !email || !password || !role || !location) {
            return res.status(400).json({message: "Please fill in all required fields"});
        }
        const userExists = await User.findOne({email});
        if (userExists) {
            return res
            .status(400)
            .json({ message: "User already exists" });
        }

        const user = await User.create({username, email, password, firstName, lastName, phone, location, role, businessName});
        const token = generateToken(user._id);
        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token,
        });
    } catch (error) {
        res.status(500).json({message: "Server error"});

    }
});
//Login user
router.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        if (!email || !password) {
            return res
            .status(400)
            .json({ message: "Please provide all fields"});
        }
        const user = await User.findOne({email});
        if (!user || !(await user.matchPassword(password))) {
            return res
            .status(401)
            .json({ message: "Invalid credentials"});
        }
        const token = generateToken(user._id);
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error"});

    }
});

//Get current user
router.get("/me", protect, async (req, res) => {
    res.status(200).json(req.user);
});

//Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

}

export default router;