// Authentication Controller
//Debashish
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { generate6DigitCode } from '../utils/tokenHelper.js';
import sendEmail from '../utils/sendEmail.js';

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
    if (!username || !email || !password || !firstName || !phone || !role || !location) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }
    // email format (something@gmail.com or other domains)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // password requirements
    // At least 8 characters
    // Must contain at least one number
    // Must contain at least one special character
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

    // phone number format (+880 followed by 10 digits)
    if (phone) {
      const phoneRegex = /^\+880\d{10}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ 
          message: 'Phone number must start with +880 and be followed by exactly 10 digits' 
        });
      }
    }
    if (firstName.length < 2 || firstName.length > 50) {
      return res.status(400).json({ message: 'First name must be between 2 and 50 characters' });
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

    if (process.env.EMAIL_VERIFICATION_ENABLED === 'true') {
      const code = generate6DigitCode();
      user.emailVerificationCode = code;
      user.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 min
      await user.save();
      await sendEmail(user.email, 'Your Verification Code', `Your code: ${code}`);
      return res.status(201).json({ message: 'Verification code sent', userId: user._id });
    } else {
      user.emailVerified = true;
      await user.save();
      const token = generateToken(user._id);
      return res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};
// Email verification
// @desc    Verify user email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  const { userId, code } = req.body;
  const user = await User.findById(userId);
  if (!user || user.emailVerificationCode !== code || user.emailVerificationExpires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }
  user.emailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  res.json({ message: 'Email verified' });
};
// Forgot password
// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    // 1. Check if email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // 3. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // 4. Check if email verification is enabled
    if (process.env.EMAIL_VERIFICATION_ENABLED === 'true') {
      const code = generate6DigitCode();
      user.passwordResetCode = code;
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();
      await sendEmail(user.email, 'Password Reset Code', `Your password reset code: ${code}`);
      return res.json({ message: 'Reset code sent to your email', userId: user._id });
    } else {
      return res.status(400).json({ message: 'Password reset feature is currently disabled' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};// Verify reset code
// @desc    Verify password reset code
// @route   POST /api/auth/verify-reset-code
// @access  Public
export const verifyResetCode = async (req, res) => {
  const { userId, code } = req.body;
  const user = await User.findById(userId);
  if (!user || user.passwordResetCode !== code || user.passwordResetExpires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }
  res.json({ message: 'Code valid' });
};
//password reset
// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { userId, code, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (
      !user.passwordResetCode ||
      user.passwordResetCode !== code ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    user.password = newPassword; 
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }
    if (process.env.EMAIL_VERIFICATION_ENABLED === 'true' && !user.emailVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in.' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Please try again' });
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
