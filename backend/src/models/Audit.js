import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Audit statuses
const auditStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];

// Audit Schema
const auditSchema = new Schema({
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  scope: {
    type: String,
    required: [true, 'Audit scope is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Audit date is required']
  },
  auditor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Auditor is required']
  },
  status: {
    type: String,
    enum: auditStatuses,
    default: 'scheduled'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for department details
auditSchema.virtual('departmentDetails', {
  ref: 'Department',
  localField: 'department',
  foreignField: '_id',
  justOne: true
});

// Virtual for auditor details
auditSchema.virtual('auditorDetails', {
  ref: 'User',
  localField: 'auditor',
  foreignField: '_id',
  justOne: true
});

// Virtual for compliance issues
auditSchema.virtual('complianceIssues', {
  ref: 'ComplianceIssue',
  localField: '_id',
  foreignField: 'audit',
  justOne: false
});

const Audit = model('Audit', auditSchema);

export default Audit;