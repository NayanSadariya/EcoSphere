import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Participation approval statuses
const approvalStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

// Challenge Participation Schema
const challengeParticipationSchema = new Schema({
  challenge: {
    type: Schema.Types.ObjectId,
    ref: 'Challenge',
    required: [true, 'Challenge is required']
  },
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  progress: {
    type: Number,
    min: [0, 'Progress must be at least 0'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
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
  xp_awarded: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for challenge details
challengeParticipationSchema.virtual('challengeDetails', {
  ref: 'Challenge',
  localField: 'challenge',
  foreignField: '_id',
  justOne: true
});

// Virtual for employee details
challengeParticipationSchema.virtual('employeeDetails', {
  ref: 'User',
  localField: 'employee',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
challengeParticipationSchema.index({ challenge: 1 });
challengeParticipationSchema.index({ employee: 1 });
challengeParticipationSchema.index({ approval_status: 1 });

const ChallengeParticipation = model('ChallengeParticipation', challengeParticipationSchema);

export default ChallengeParticipation;