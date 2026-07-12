import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Challenge statuses
const challengeStatuses = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'COMPLETED', 'ARCHIVED'];
// Challenge difficulty levels
const challengeDifficulties = ['EASY', 'MEDIUM', 'HARD'];

// Challenge Schema
const challengeSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    trim: true
  },
  xp_value: {
    type: Number,
    required: [true, 'XP value is required'],
    min: [0, 'XP value must be non-negative']
  },
  difficulty: {
    type: String,
    enum: challengeDifficulties,
    required: [true, 'Difficulty is required']
  },
  evidence_required: {
    type: Boolean,
    default: false
  },
  deadline: {
    type: Date
  },
  status: {
    type: String,
    enum: challengeStatuses,
    default: 'DRAFT'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for category details
challengeSchema.virtual('categoryDetails', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true
});

// Virtual for challenge participations
challengeSchema.virtual('participations', {
  ref: 'ChallengeParticipation',
  localField: '_id',
  foreignField: 'challenge',
  justOne: false
});

// Method to validate status transition
challengeSchema.methods.canTransitionTo = function(newStatus) {
  const currentStatus = this.status;

  // Define valid transitions
  const validTransitions = {
    DRAFT: ['ACTIVE'],
    ACTIVE: ['UNDER_REVIEW'],
    UNDER_REVIEW: ['COMPLETED', 'ARCHIVED'],
    COMPLETED: [], // Can only go to ARCHIVED from any state
    ARCHIVED: [] // Terminal state
  };

  // Special case: any state can go to ARCHIVED
  if (newStatus === 'ARCHIVED') return true;

  return validTransitions[currentStatus] && validTransitions[currentStatus].includes(newStatus);
};

const Challenge = model('Challenge', challengeSchema);

export default Challenge;