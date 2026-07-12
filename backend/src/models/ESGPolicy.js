import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// ESGPolicy Schema
const esgPolicySchema = new Schema({
  title: {
    type: String,
    required: [true, 'Policy title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Policy description is required'],
    trim: true
  },
  version: {
    type: String,
    required: [true, 'Policy version is required'],
    trim: true
  },
  effective_date: {
    type: Date,
    required: [true, 'Effective date is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for acknowledgements
esgPolicySchema.virtual('acknowledgements', {
  ref: 'PolicyAcknowledgement',
  localField: '_id',
  foreignField: 'policy',
  justOne: false
});

const ESGPolicy = model('ESGPolicy', esgPolicySchema);

export default ESGPolicy;