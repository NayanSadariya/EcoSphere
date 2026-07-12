import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// User Badge Schema (employees earning badges)
const userBadgeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  badge: {
    type: Schema.Types.ObjectId,
    ref: 'Badge',
    required: [true, 'Badge is required']
  },
  earned_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user details
userBadgeSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Virtual for badge details
userBadgeSchema.virtual('badgeDetails', {
  ref: 'Badge',
  localField: 'badge',
  foreignField: '_id',
  justOne: true
});

// Compound index to prevent duplicate badges for same user
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });

const UserBadge = model('UserBadge', userBadgeSchema);

export default UserBadge;