import pkg from 'jsonwebtoken';
const { verify } = pkg;
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password_hash');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Alias for backward compatibility/external usage
const authenticateToken = protect;

// Admin middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

// Manager or above middleware
const authorizeManagerOrAbove = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a manager or above');
  }
};

// Employee or above middleware
const authorizeEmployeeOrAbove = (req, res, next) => {
  if (req.user &&
      (req.user.role === 'admin' ||
       req.user.role === 'manager' ||
       req.user.role === 'employee')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized');
  }
};

export {
  protect,
  authenticateToken,
  authorizeAdmin,
  authorizeManagerOrAbove,
  authorizeEmployeeOrAbove
};