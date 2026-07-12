import asyncHandler from 'express-async-handler';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { genSalt, hash, compare } from 'bcryptjs';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (id) => {
  return sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, department, role } = req.body;

  // Validate required fields
  if (!name || !email || !password || !department) {
    res.status(400);
    throw new Error('Please provide name, email, password, and department');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Hash password
  const salt = await genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
  const hashedPassword = await hash(password, salt);

  // Create user
  const user = await User.create({
    name,
    email,
    password_hash: hashedPassword,
    department,
    role: role || 'employee'
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Check for user
  const user = await User.findOne({ email });

  if (user && (await compare(password, user.password_hash))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password_hash');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    // Note: We don't allow changing department or role through this endpoint
    // Those would require separate admin endpoints

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      department: updatedUser.department,
      role: updatedUser.role
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Please provide current and new password');
    }

    // Check if current password is correct
    const isMatch = await compare(currentPassword, user.password_hash);

    if (!isMatch) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const salt = await genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
    user.password_hash = await hash(newPassword, salt);

    await user.save();
    res.json({ message: 'Password changed successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword
};