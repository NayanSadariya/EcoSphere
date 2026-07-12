import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Department Score Schema
const departmentScoreSchema = new Schema({
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required'],
    unique: true
  },
  environmental_score: {
    type: Number,
    default: 0
  },
  social_score: {
    type: Number,
    default: 0
  },
  governance_score: {
    type: Number,
    default: 0
  },
  total_score: {
    type: Number,
    default: 0
  },
  calculated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for department details
departmentScoreSchema.virtual('departmentDetails', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

// Index for faster lookup
departmentScoreSchema.index({ department: 1 });

const DepartmentScore = model('DepartmentScore', departmentScoreSchema);

export default DepartmentScore;