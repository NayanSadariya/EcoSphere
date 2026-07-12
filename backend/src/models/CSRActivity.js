import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// CSRActivity Schema
const csrActivitySchema = new Schema({
  title: {
    type: String,
    required: [true, 'Activity title is required'],
    trim: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for category details
csrActivitySchema.virtual('categoryDetails', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true
});

// Virtual for department details
csrActivitySchema.virtual('departmentDetails', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

// Virtual for employee participations
csrActivitySchema.virtual('participations', {
  ref: 'EmployeeParticipation',
  localField: '_id',
  foreignField: 'activity',
  justOne: false
});

const CSRActivity = model('CSRActivity', csrActivitySchema);

export default CSRActivity;