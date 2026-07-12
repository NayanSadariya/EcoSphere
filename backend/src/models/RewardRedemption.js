import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Reward Redemption Schema
const rewardRedemptionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  reward: {
    type: Schema.Types.ObjectId,
    ref: 'Reward',
    required: [true, 'Reward is required']
  },
  points_spent: {
    type: Number,
    required: [true, 'Points spent is required']
  },
  redeemed_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user details
rewardRedemptionSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

// Virtual for reward details
rewardRedemptionSchema.virtual('rewardDetails', {
  ref: 'Reward',
  localField: 'reward',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
rewardRedemptionSchema.index({ user: 1 });
rewardRedemptionSchema.index({ reward: 1 });
rewardRedemptionSchema.index({ redeemed_at: -1 });

const RewardRedemption = model('RewardRedemption', rewardRedemptionSchema);

export default RewardRedemption;