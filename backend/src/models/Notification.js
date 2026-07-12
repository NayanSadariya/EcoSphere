import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Notification types (matching the events that trigger notifications)
const notificationTypes = [
  'new_compliance_issue',
  'csr_participation_approved',
  'csr_participation_rejected',
  'challenge_participation_approved',
  'challenge_participation_rejected',
  'policy_acknowledgement_reminder',
  'badge_unlocked',
  'compliance_issue_overdue'
];

// Notification Schema
const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  type: {
    type: String,
    enum: notificationTypes,
    required: [true, 'Notification type is required']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  is_read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for recipient details
notificationSchema.virtual('recipientDetails', {
  ref: 'User',
  localField: 'recipient',
  foreignField: '_id',
  justOne: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ is_read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = model('Notification', notificationSchema);

export default Notification;