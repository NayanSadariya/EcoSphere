import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Employee Badge Schema (for tracking awarded badges)
const employeeBadgeSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
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

// Virtual for employee details
employeeBadgeSchema.virtual('employeeDetails', {
  ref: 'User',
  localField: 'employee',
  foreignField: '_id',
  justOne: true
});

// Virtual for badge details
employeeBadgeSchema.virtual('badgeDetails', {
  ref: 'Badge',
  localField: 'badge',
  foreignField: '_id',
  justOne: true
});

// Compound index to prevent duplicate badges for same employee
employeeBadgeSchema.index({ employee: 1, badge: 1 }, { unique: true });

const EmployeeBadge = model('EmployeeBadge', employeeBadgeSchema);

export default EmployeeBadge;