import asyncHandler from 'express-async-handler';
import { findOne, create, deleteMany } from '../models/Settings.js';

// @desc    Get settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
  let settings = await findOne({});

  // If no settings exist, create default ones
  if (!settings) {
    settings = await create({
      auto_emission_calculation_enabled: true,
      evidence_requirement_enabled: true,
      badge_auto_award_enabled: true,
      notification_settings: {
        new_compliance_issue: true,
        csr_participation_approved: true,
        csr_participation_rejected: true,
        challenge_participation_approved: true,
        challenge_participation_rejected: true,
        policy_acknowledgement_reminder: true,
        badge_unlocked: true,
        compliance_issue_overdue: true
      },
      esg_weights: {
        environmental_weight: 0.4,
        social_weight: 0.3,
        governance_weight: 0.3
      }
    });
  }

  res.json(settings);
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await findOne({});

  // If no settings exist, create them
  if (!settings) {
    settings = await create({});
  }

  // Update fields if provided
  if (req.body.auto_emission_calculation_enabled !== undefined) {
    settings.auto_emission_calculation_enabled = req.body.auto_emission_calculation_enabled;
  }

  if (req.body.evidence_requirement_enabled !== undefined) {
    settings.evidence_requirement_enabled = req.body.evidence_requirement_enabled;
  }

  if (req.body.badge_auto_award_enabled !== undefined) {
    settings.badge_auto_award_enabled = req.body.badge_auto_award_enabled;
  }

  if (req.body.notification_settings) {
    settings.notification_settings = {
      ...settings.notification_settings,
      ...req.body.notification_settings
    };
  }

  if (req.body.esg_weights) {
    settings.esg_weights = {
      ...settings.esg_weights,
      ...req.body.esg_weights
    };
  }

  const updatedSettings = await settings.save();
  res.json(updatedSettings);
});

// @desc    Reset settings to default
// @route   DELETE /api/settings
// @access  Private/Admin
const resetSettings = asyncHandler(async (req, res) => {
  await deleteMany({});

  const defaultSettings = await create({
    auto_emission_calculation_enabled: true,
    evidence_requirement_enabled: true,
    badge_auto_award_enabled: true,
    notification_settings: {
      new_compliance_issue: true,
      csr_participation_approved: true,
      csr_participation_rejected: true,
      challenge_participation_approved: true,
      challenge_participation_rejected: true,
      policy_acknowledgement_reminder: true,
      badge_unlocked: true,
      compliance_issue_overdue: true
    },
    esg_weights: {
      environmental_weight: 0.4,
      social_weight: 0.3,
      governance_weight: 0.3
    }
  });

  res.json(defaultSettings);
});

export default {
  getSettings,
  updateSettings,
  resetSettings
};