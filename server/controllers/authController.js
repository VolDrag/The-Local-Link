// Authentication Controller
//Debashish
import User from '../models/User.js';
import { generate6DigitCode } from '../utils/tokenHelper.js';
import sendEmail from '../utils/sendEmail.js';
import { signAccessToken, issueRefreshToken, rotateRefreshToken, revokeRefreshToken, buildAuthPayload } from '../utils/tokens.js';
import { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } from '../utils/cookies.js';

const attachSession = async (res, user, req) => {
  const token = signAccessToken(user._id);
  const refreshToken = await issueRefreshToken(user._id, req);
  setAuthCookies(res, token, refreshToken);
  return buildAuthPayload(user, token);
};

export const registerUser = async (req, res) => {
  const { username, email, password, firstName, lastName, phone, location, role, businessName, referralCode } = req.body;
  
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const hasNumber = /\d/.test(password);
    if (!hasNumber) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }

    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    if (!hasSpecialChar) {
      return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&* etc.)' });
    }

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

    let referredBy;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (referrer) referredBy = referrer._id;
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
      referredBy,
      identityVerification: { status: role === 'provider' ? 'unsubmitted' : 'unsubmitted' },
    });

    if (process.env.EMAIL_VERIFICATION_ENABLED === 'true') {
      const code = generate6DigitCode();
      user.emailVerificationCode = code;
      user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
      await user.save();
      await sendEmail(user.email, 'Your Verification Code', `Your code: ${code}`);
      return res.status(201).json({ message: 'Verification code sent', userId: user._id });
    }

    user.emailVerified = true;
    await user.save();
    const payload = await attachSession(res, user, req);
    return res.status(201).json(payload);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    if (process.env.EMAIL_VERIFICATION_ENABLED === 'true') {
      const code = generate6DigitCode();
      user.passwordResetCode = code;
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
      await user.save();
      await sendEmail(user.email, 'Password Reset Code', `Your password reset code: ${code}`);
      return res.json({ message: 'Reset code sent to your email', userId: user._id });
    }
    return res.status(400).json({ message: 'Password reset feature is currently disabled' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

export const verifyResetCode = async (req, res) => {
  const { userId, code } = req.body;
  const user = await User.findById(userId);
  if (!user || user.passwordResetCode !== code || user.passwordResetExpires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }
  res.json({ message: 'Code valid' });
};

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
    
    const payload = await attachSession(res, user, req);
    res.status(200).json(payload);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const payload = await attachSession(res, user, req);
    res.json(payload);
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

export const refreshSession = async (req, res) => {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE];
    const rotated = await rotateRefreshToken(raw, req);
    if (!rotated) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Refresh token invalid or expired' });
    }
    const user = await User.findById(rotated.userId).select('-password');
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'User not found' });
    }
    const accessToken = signAccessToken(user._id);
    setAuthCookies(res, accessToken, rotated.refreshToken);
    res.json(buildAuthPayload(user, accessToken));
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ message: 'Could not refresh session' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    await revokeRefreshToken(req.cookies?.[REFRESH_COOKIE]);
    clearAuthCookies(res);
    res.json({ message: 'Logged out' });
  } catch (error) {
    clearAuthCookies(res);
    res.json({ message: 'Logged out' });
  }
};

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
