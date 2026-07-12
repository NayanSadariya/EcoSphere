import { Types } from 'mongoose';
import Department from '../models/Department.js';
import CarbonTransaction from '../models/CarbonTransaction.js';
import EmployeeParticipation from '../models/EmployeeParticipation.js';
import ChallengeParticipation from '../models/ChallengeParticipation.js';
import Audit from '../models/Audit.js';
import ComplianceIssue from '../models/ComplianceIssue.js';
import PolicyAcknowledgement from '../models/PolicyAcknowledgement.js';
import DepartmentScore from '../models/DepartmentScore.js';
import Settings from '../models/Settings.js';

class ScoringService {
  /**
   * Calculate environmental score for a department
   * Lower CO2 emissions = higher score
   * Formula: 100 - (CO2 per employee * normalization factor) capped at 0-100
   */
  static async calculateEnvironmentalScore(departmentId) {
    try {
      // Get department info
      const department = await Department.findById(departmentId);
      if (!department) throw new Error('Department not found');

      // Get employee count
      const employeeCount = await this.getEmployeeCount(departmentId);
      if (employeeCount === 0) return 100; // No employees, perfect score

      // Get total CO2 emissions for the department
      const totalCO2 = await this.getDepartmentTotalCO2(departmentId);

      // Calculate CO2 per employee
      const co2PerEmployee = totalCO2 / employeeCount;

      // Normalize: assume 10 kg CO2 per employee per day is excellent (score 100)
      // and 100 kg CO2 per employee per day is poor (score 0)
      // Formula: score = 100 - (co2PerEmployee - 10) * (100/90) clamped to 0-100
      let score = 100 - ((co2PerEmployee - 10) * (100/90));
      score = Math.max(0, Math.min(100, score));

      return Math.round(score * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      console.error('Error calculating environmental score:', error);
      throw error;
    }
  }

  /**
   * Calculate social score for a department
   * Based on CSR participation rates and diversity/training metrics
   */
  static async calculateSocialScore(departmentId) {
    try {
      // Get department info
      const department = await Department.findById(departmentId);
      if (!department) throw new Error('Department not found');

      // Get employee count
      const employeeCount = await this.getEmployeeCount(departmentId);
      if (employeeCount === 0) return 100;

      // Calculate CSR participation rate
      const participationRate = await this.getCSRParticipationRate(departmentId);

      // For simplicity, we'll base social score primarily on CSR participation
      // In a real system, this would also include diversity metrics, training hours, etc.
      const socialScore = participationRate * 100; // Convert percentage to 0-100 scale

      return Math.round(socialScore * 100) / 100;
    } catch (error) {
      console.error('Error calculating social score:', error);
      throw error;
    }
  }

  /**
   * Calculate governance score for a department
   * Based on audit results, compliance issue resolution, and policy acknowledgment rates
   */
  static async calculateGovernanceScore(departmentId) {
    try {
      // Get department info
      const department = await Department.findById(departmentId);
      if (!department) throw new Error('Department not found');

      // Get employee count
      const employeeCount = await this.getEmployeeCount(departmentId);
      if (employeeCount === 0) return 100;

      // Calculate components:
      // 1. Audit score (based on recent audit results)
      const auditScore = await this.getAuditScore(departmentId);

      // 2. Compliance issue resolution rate
      const resolutionRate = await this.getComplianceResolutionRate(departmentId);

      // 3. Policy acknowledgment rate
      const acknowledgmentRate = await this.getPolicyAcknowledgmentRate(departmentId);

      // Weighted average (can adjust weights as needed)
      const governanceScore = (
        auditScore * 0.4 +
        resolutionRate * 0.3 +
        acknowledgmentRate * 0.3
      ) * 100; // Convert to 0-100 scale

      return Math.round(governanceScore * 100) / 100;
    } catch (error) {
      console.error('Error calculating governance score:', error);
      throw error;
    }
  }

  /**
   * Calculate and update department score
   */
  static async calculateAndUpdateDepartmentScore(departmentId) {
    try {
      // Get ESG weights from settings
      const weights = await this.getESGWeights();

      // Calculate individual scores
      const [environmentalScore, socialScore, governanceScore] = await Promise.all([
        this.calculateEnvironmentalScore(departmentId),
        this.calculateSocialScore(departmentId),
        this.calculateGovernanceScore(departmentId)
      ]);

      // Calculate total score using weights
      const totalScore = (
        environmentalScore * weights.environmental_weight +
        socialScore * weights.social_weight +
        governanceScore * weights.governance_weight
      );

      // Update or create department score
      const departmentScore = await DepartmentScore.findOneAndUpdate(
        { department: departmentId },
        {
          environmental_score: environmentalScore,
          social_score: socialScore,
          governance_score: governanceScore,
          total_score: totalScore,
          calculated_at: new Date()
        },
        { upsert: true, new: true }
      );

      return departmentScore;
    } catch (error) {
      console.error('Error calculating and updating department score:', error);
      throw error;
    }
  }

  /**
   * Calculate overall ESG score for the organization
   * Weighted average of all department scores
   */
  static async calculateOrganizationalESGScore() {
    try {
      // Get ESG weights from settings
      const weights = await this.getESGWeights();

      // Get all department scores
      const departmentScores = await DepartmentScore.find().populate('department');

      if (departmentScores.length === 0) return 0;

      // Calculate weighted average
      let weightedSum = 0;
      let totalWeight = 0;

      for (const deptScore of departmentScores) {
        // Weight by employee count or equal weight? Let's use equal weight for simplicity
        weightedSum += deptScore.total_score;
        totalWeight += 1;
      }

      const organizationalScore = weightedSum / totalWeight;
      return Math.round(organizationalScore * 100) / 100;
    } catch (error) {
      console.error('Error calculating organizational ESG score:', error);
      throw error;
    }
  }

  // Helper methods
  static async getEmployeeCount(departmentId) {
    return this.countDocuments('User', { department: departmentId, status: 'active' });
  }

  static async getDepartmentTotalCO2(departmentId) {
    const result = await CarbonTransaction.aggregate([
      { $match: { department: new Types.ObjectId(departmentId) } },
      { $group: { _id: null, total: { $sum: '$calculated_co2' } } }
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  static async getCSRParticipationRate(departmentId) {
    const employeeCount = await this.getEmployeeCount(departmentId);
    if (employeeCount === 0) return 0;

    // Count unique employees who participated in approved CSR activities
    const participatingEmployees = await EmployeeParticipation.distinct('employee', {
      activity: {
        $in: await this.getCSRActivityIdsForDepartment(departmentId)
      },
      approval_status: 'APPROVED'
    });

    return participatingEmployees.length / employeeCount;
  }

  static async getCSRActivityIdsForDepartment(departmentId) {
    const activities = await this.findMany('CSRActivity', { department: departmentId });
    return activities.map(activity => activity._id);
  }

  static async getAuditScore(departmentId) {
    // Get recent audits (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const audits = await this.findMany('Audit', {
      department: departmentId,
      date: { $gte: sixMonthsAgo },
      status: 'completed'
    });

    if (audits.length === 0) return 0.8; // Default good score if no audits

    // For simplicity, we'll assume all completed audits are good
    // In a real system, we'd look at audit scores/findings
    return 0.8;
  }

  static async getComplianceResolutionRate(departmentId) {
    const issues = await this.findMany('ComplianceIssue', {
      'audit.department': departmentId
    });

    if (issues.length === 0) return 1.0; // No issues = perfect score

    const resolvedIssues = issues.filter(issue => issue.status === 'RESOLVED');
    return resolvedIssues.length / issues.length;
  }

  static async getPolicyAcknowledgmentRate(departmentId) {
    const employeeCount = await this.getEmployeeCount(departmentId);
    if (employeeCount === 0) return 1.0;

    // Get policies that require acknowledgment
    const policies = await this.findMany('ESGPolicy', {});

    if (policies.length === 0) return 1.0; // No policies = perfect score

    // For each policy, check what percentage of employees acknowledged it
    let totalAcknowledgmentRate = 0;

    for (const policy of policies) {
      const acknowledgements = await this.countDocuments('PolicyAcknowledgement', {
        policy: policy._id,
        employee: { $in: await this.getEmployeeIdsForDepartment(departmentId) },
        acknowledged_date: { $ne: null }
      });

      const rate = acknowledgements / employeeCount;
      totalAcknowledgmentRate += rate;
    }

    return totalAcknowledgmentRate / policies.length;
  }

  static async getEmployeeIdsForDepartment(departmentId) {
    const employees = await this.findMany('User', { department: departmentId, status: 'active' });
    return employees.map(employee => employee._id);
  }

  static async getESGWeights() {
    // Try to get settings from database
    let settings = await this.findOne('Settings', {});

    // If no settings exist, create default ones
    if (!settings) {
      settings = await this.create('Settings', {
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

    return settings.esg_weights || {
      environmental_weight: 0.4,
      social_weight: 0.3,
      governance_weight: 0.3
    };
  }

  // Generic helper methods
  static async findOne(modelName, query) {
    const Model = require(`../models/${modelName}`);
    return Model.findOne(query);
  }

  static async findMany(modelName, query) {
    const Model = require(`../models/${modelName}`);
    return Model.find(query);
  }

  static async countDocuments(modelName, query) {
    const Model = require(`../models/${modelName}`);
    return Model.countDocuments(query);
  }

  static async create(modelName, data) {
    const Model = require(`../models/${modelName}`);
    return Model.create(data);
  }
}

export default ScoringService;