import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

// Settings Schema (singleton - only one document)
const settingsSchema = new Schema({
  auto_emission_calculation_enabled: {
    type: Boolean,
    default: true
  },
  evidence_requirement_enabled: {
    type: Boolean,
    default: true
  },
  badge_auto_award_enabled: {
    type: Boolean,
    default: true
  },
  notification_settings: {
    type: Schema.Types.Mixed,
    default: {
      new_compliance_issue: true,
      csr_participation_approved: true,
      csr_participation_rejected: true,
      challenge_participation_approved: true,
      challenge_participation_rejected: true,
      policy_acknowledgement_reminder: true,
      badge_unlocked: true,
      compliance_issue_overdue: true
    }
  },
  esg_weights: {
    environmental_weight: {
      type: Number,
      default: 0.4,
      min: 0,
      max: 1
    },
    social_weight: {
      type: Number,
      default: 0.3,
      min: 0,
      max: 1
    },
    governance_weight: {
      type: Number,
      default: 0.3,
      min: 0,
      max: 1
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure only one settings document exists
settingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = model('Settings', settingsSchema);

export default Settings;