import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Compliance issue severities
const issueSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
// Compliance issue statuses
const issueStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

// Compliance Issue Schema
const complianceIssueSchema = new Schema({
  audit: {
    type: Schema.Types.ObjectId,
    ref: 'Audit',
    required: [true, 'Audit is required']
  },
  severity: {
    type: String,
    enum: issueSeverities,
    required: [true, 'Severity is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  due_date: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: issueStatuses,
    default: 'OPEN'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for audit details
complianceIssueSchema.virtual('auditDetails', {
  ref: 'Audit',
  localField: 'audit',
  foreignField: '_id',
  justOne: true
});

// Virtual for owner details
complianceIssueSchema.virtual('ownerDetails', {
  ref: 'User',
  localField: 'owner',
  foreignField: '_id',
  justOne: true
});

// Virtual for department (through audit)
complianceIssueSchema.virtual('departmentDetails', {
  ref: 'Department',
  localField: 'audit.department',
  foreignField: '_id',
  justOne: true
});

// Virtual for calculating is_overdue (virtual field)
complianceIssueSchema.virtual('is_overdue').get(function() {
  if (this.status === 'RESOLVED') return false;
  return this.due_date < new Date();
});

const ComplianceIssue = model('ComplianceIssue', complianceIssueSchema);

export default ComplianceIssue;