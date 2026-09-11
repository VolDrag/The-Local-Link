import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { ACCESS_COOKIE } from '../utils/cookies.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.[ACCESS_COOKIE]) {
    token = req.cookies[ACCESS_COOKIE];
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

export { protect };
