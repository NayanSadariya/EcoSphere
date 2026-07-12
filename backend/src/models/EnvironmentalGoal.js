import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Define goal statuses
const goalStatuses = ['active', 'achieved', 'failed', 'archived'];

// EnvironmentalGoal Schema
const environmentalGoalSchema = new Schema({
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: false // nullable for org-wide goals
  },
  target_metric: {
    type: String,
    required: [true, 'Target metric is required'],
    trim: true
  },
  target_value: {
    type: Number,
    required: [true, 'Target value is required']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  status: {
    type: String,
    enum: goalStatuses,
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for department name
environmentalGoalSchema.virtual('departmentDetails', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: false
});

const EnvironmentalGoal = model('EnvironmentalGoal', environmentalGoalSchema);

export default EnvironmentalGoal;