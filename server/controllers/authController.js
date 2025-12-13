// Authentication Controller

import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { username, email, password, firstName, lastName, phone, location, role, businessName } = req.body;
  
  try {
    if (!username || !email || !password || !role || !location) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // 2. Validate email format (something@gmail.com or other domains)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address (e.g., example@gmail.com)' });
    }

    // 3. Validate password requirements
    // - At least 8 characters
    // - Must contain at least one number
    // - Must contain at least one special character
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const hasNumber = /\d/.test(password);
    if (!hasNumber) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }

    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasSpecialChar) {
      return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&* etc.)' });
    }

    // 4. Validate phone number format (+880 followed by 10 digits)
    if (phone) {
      const phoneRegex = /^\+880\d{10}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ 
          message: 'Phone number must start with +880 and be followed by exactly 10 digits (e.g., +8801712345678)' 
        });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      location,
      role,
      businessName,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user and verify they are an admin
    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      adminLevel: user.adminLevel,
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

// @desc    Setup admin (one-time use - remove after)
// @route   POST /api/auth/admin/setup
// @access  Public
export const setupAdmin = async (req, res) => {
  try {
    const { email, password, username, firstName, lastName, adminLevel } = req.body;

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await User.create({
      email,
      password,
      username,
      firstName,
      lastName,
      role: 'admin',
      adminLevel: adminLevel || 'super_admin',
      location: 'N/A',
    });

    res.status(201).json({
      message: 'Admin created successfully',
      adminId: admin._id,
      email: admin.email,
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
};
