import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Policy Acknowledgement Schema
const policyAcknowledgementSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee is required']
  },
  policy: {
    type: Schema.Types.ObjectId,
    ref: 'ESGPolicy',
    required: [true, 'Policy is required']
  },
  acknowledged_date: {
    type: Date,
    default: null // nullable = not acknowledged
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for employee details
policyAcknowledgementSchema.virtual('employeeDetails', {
  ref: 'User',
  localField: 'employee',
  foreignField: '_id',
  justOne: true
});

// Virtual for policy details
policyAcknowledgementSchema.virtual('policyDetails', {
  ref: 'ESGPolicy',
  localField: 'policy',
  foreignField: '_id',
  justOne: true
});

// Compound index to prevent duplicate acknowledgements
policyAcknowledgementSchema.index({ employee: 1, policy: 1 }, { unique: true });

const PolicyAcknowledgement = model('PolicyAcknowledgement', policyAcknowledgementSchema);

export default PolicyAcknowledgement;