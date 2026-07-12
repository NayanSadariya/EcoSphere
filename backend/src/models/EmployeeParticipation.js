import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Participation approval statuses
const approvalStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

// Employee Participation Schema
const employeeParticipationSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  activity: {
    type: Schema.Types.ObjectId,
    ref: 'CSRActivity',
    required: [true, 'Activity is required']
  },
  proof_file_url: {
    type: String,
    trim: true
  },
  approval_status: {
    type: String,
    enum: approvalStatuses,
    default: 'PENDING'
  },
  points_earned: {
    type: Number,
    default: 0
  },
  completion_date: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for employee details
employeeParticipationSchema.virtual('employeeDetails', {
  ref: 'User',
  localField: 'employee',
  foreignField: '_id',
  justOne: true
});

// Virtual for activity details
employeeParticipationSchema.virtual('activityDetails', {
  ref: 'CSRActivity',
  localField: 'activity',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
employeeParticipationSchema.index({ employee: 1 });
employeeParticipationSchema.index({ activity: 1 });
employeeParticipationSchema.index({ approval_status: 1 });

const EmployeeParticipation = model('EmployeeParticipation', employeeParticipationSchema);

export default EmployeeParticipation;