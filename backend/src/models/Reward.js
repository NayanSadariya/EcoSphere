import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Reward statuses
const rewardStatuses = ['active', 'inactive', 'out_of_stock'];

// Reward Schema
const rewardSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Reward name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Reward description is required'],
    trim: true
  },
  points_required: {
    type: Number,
    required: [true, 'Points required is required'],
    min: [0, 'Points required must be non-negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity must be non-negative']
  },
  status: {
    type: String,
    enum: rewardStatuses,
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for redemptions
rewardSchema.virtual('redemptions', {
  ref: 'RewardRedemption',
  localField: '_id',
  foreignField: 'reward',
  justOne: false
});

// Virtual to check if reward is available for redemption
rewardSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.stock > 0;
});

const Reward = model('Reward', rewardSchema);

export default Reward;