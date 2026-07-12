import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Badge Schema
const badgeSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Badge description is required'],
    trim: true
  },
  unlock_rule: {
    type: Schema.Types.Mixed,
    required: [true, 'Unlock rule is required'],
    validate: {
      validator: function(value) {
        // Validate unlock_rule structure
        // Expected formats:
        // {"type": "xp_gte", "value": 500}
        // {"type": "challenges_completed_gte", "value": 5}
        // {"type": "points_balance_gte", "value": 1000}
        if (!value || typeof value !== 'object') return false;
        if (!value.type || !value.value) return false;
        const validTypes = ['xp_gte', 'challenges_completed_gte', 'points_balance_gte'];
        return validTypes.includes(value.type);
      },
      message: props => `${props.value} is not a valid unlock rule!`
    }
  },
  icon_url: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for employee badges (awards)
badgeSchema.virtual('awards', {
  ref: 'EmployeeBadge',
  localField: '_id',
  foreignField: 'badge',
  justOne: false
});

const Badge = model('Badge', badgeSchema);

export default model('Badge', badgeSchema);

export default Badge;