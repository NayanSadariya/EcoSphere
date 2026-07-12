import mongoose, { model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';
const { Schema } = mongoose;

// Define user roles
const userRoles = ['admin', 'manager', 'employee'];

// Define user statuses
const userStatuses = ['active', 'inactive', 'suspended'];

// User/Employee Schema
const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  role: {
    type: String,
    enum: userRoles,
    default: 'employee'
  },
  status: {
    type: String,
    enum: userStatuses,
    default: 'active'
  },
  xp_total: {
    type: Number,
    default: 0
  },
  points_balance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) return next();

  try {
    const salt = await genSalt(Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password_hash = await hash(this.password_hash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await compare(candidatePassword, this.password_hash);
};

// Virtual for badges (will be populated via reference)
userSchema.virtual('badges', {
  ref: 'UserBadge',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

// Virtual for rewards (redemptions)
userSchema.virtual('rewards', {
  ref: 'RewardRedemption',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

const User = model('User', userSchema);

export default User;