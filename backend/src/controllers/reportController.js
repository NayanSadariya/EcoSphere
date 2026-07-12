import asyncHandler from 'express-async-handler';
import { createObjectCsvWriter } from 'csv-writer';
import User from '../models/User.js';
import Department from '../models/Department.js';
import CarbonTransaction from '../models/CarbonTransaction.js';
import CSRActivity from '../models/CSRActivity.js';
import EmployeeParticipation from '../models/EmployeeParticipation.js';
import Challenge from '../models/Challenge.js';
import ChallengeParticipation from '../models/ChallengeParticipation.js';
import Audit from '../models/Audit.js';
import ComplianceIssue from '../models/ComplianceIssue.js';
import ESGPolicy from '../models/ESGPolicy.js';
import PolicyAcknowledgement from '../models/PolicyAcknowledgement.js';
import Reward from '../models/Reward.js';
import RewardRedemption from '../models/RewardRedemption.js';
import Badge from '../models/Badge.js';
import EmployeeBadge from '../models/EmployeeBadge.js';
import ScoringService from '../utils/scoringService.js';

// Helper function to format date for CSV
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

// @desc    Get environmental report
// @route   GET /api/reports/environmental
// @access  Private
const getEnvironmentalReport = asyncHandler(async (req, res) => {
  const { department, startDate, endDate, format = 'json' } = req.query;

  // Build filter for carbon transactions
  const filter = {};
  if (department) filter.department = department;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  // Get carbon transactions with department info
  const transactions = await CarbonTransaction.find(filter)
    .populate('department', 'name code')
    .sort({ date: 1 });

  // Calculate totals by department
  const departmentStats = {};

  transactions.forEach(t => {
    const deptId = t.department._id.toString();
    if (!departmentStats[deptId]) {
      departmentStats[deptId] = {
        department: {
          _id: t.department._id,
          name: t.department.name,
          code: t.department.code
        },
        total_co2: 0,
        by_source_type: {},
        count: 0
      };
    }

    const deptStat = departmentStats[deptId];
    deptStat.total_co2 += t.calculated_co2;
    deptStat.by_source_type[t.source_type] = (deptStat.by_source_type[t.source_type] || 0) + t.calculated_co2;
    deptStat.count++;
  });

  // Convert to array for easier consumption
  const result = Object.values(departmentStats);

  if (format === 'csv') {
    // Generate CSV
    const csvWriter = createObjectCsvWriter({
      path: 'environmental_report.csv',
      header: [
        { id: 'department_name', title: 'Department Name' },
        { id: 'department_code', title: 'Department Code' },
        { id: 'total_co2', title: 'Total CO2 (kg)' },
        { id: 'record_count', title: 'Record Count' },
        { id: 'purchase_co2', title: 'Purchase CO2 (kg)' },
        { id: 'manufacturing_co2', title: 'Manufacturing CO2 (kg)' },
        { id: 'expense_co2', title: 'Expense CO2 (kg)' },
        { id: 'fleet_co2', title: 'Fleet CO2 (kg)' }
      ]
    });

    const csvData = result.map(stat => ({
      department_name: stat.department.name,
      department_code: stat.department.code,
      total_co2: stat.total_co2.toFixed(2),
      record_count: stat.count,
      purchase_co2: (stat.by_source_type.PURCHASE || 0).toFixed(2),
      manufacturing_co2: (stat.by_source_type.MANUFACTURING || 0).toFixed(2),
      expense_co2: (stat.by_source_type.EXPENSE || 0).toFixed(2),
      fleet_co2: (stat.by_source_type.FLEET || 0).toFixed(2)
    }));

    await csvWriter.writeRecords(csvData);
    res.download('environmental_report.csv');
  } else {
    res.json(result);
  }
});

// @desc    Get social report
// @route   GET /api/reports/social
// @access  Private
const getSocialReport = asyncHandler(async (req, res) => {
  const { department, startDate, endDate, format = 'json' } = req.query;

  // Build filter for CSR activities and participations
  const activityFilter = {};
  if (department) activityFilter.department = department;
  if (startDate || endDate) {
    activityFilter.date = {};
    if (startDate) activityFilter.date.$gte = new Date(startDate);
    if (endDate) activityFilter.date.$lte = new Date(endDate);
  }

  // Get CSR activities
  const activities = await CSRActivity.find(activityFilter)
    .populate('department', 'name code')
    .populate('category', 'name type')
    .sort({ date: -1 });

  // Get participations for these activities
  const activityIds = activities.map(a => a._id);
  const participations = await ChallengeParticipation.find({ activity: { $in: activityIds } })
    .populate('employee', 'name email department')
    .populate('activity', 'title description date')
    .sort({ createdAt: -1 });

  // Calculate participation stats by department
  const deptStats = {};

  // Initialize stats for each department
  activities.forEach(activity => {
    const deptId = activity.department._id.toString();
    if (!deptStats[deptId]) {
      deptStats[deptId] = {
        department: {
          _id: activity.department._id,
          name: activity.department.name,
          code: activity.department.code
        },
        activities: [],
        total_activities: 0,
        total_participations: 0,
        unique_participants: new Set(),
        approved_participations: 0
      };
    }
  });

  // Process activities
  activities.forEach(activity => {
    const deptId = activity.department._id.toString();
    deptStats[deptId].activities.push({
      _id: activity._id,
      title: activity.title,
      category: activity.category.name,
      date: activity.date
    });
    deptStats[deptId].total_activities++;
  });

  // Process participations
  participations.forEach(p => {
    const deptId = p.activity.department._id.toString();
    if (deptStats[deptId]) {
      deptStats[deptId].total_participations++;
      deptStats[deptId].unique_participants.add(p.employee._id.toString());
      if (p.approval_status === 'APPROVED') {
        deptStats[deptId].approved_participations++;
      }
    }
  });

  // Convert sets to counts and calculate rates
  const result = Object.values(deptStats).map(stat => ({
    ...stat,
    unique_participants_count: stat.unique_participants.size,
    participation_rate: stat.total_activities > 0
      ? (stat.unique_participants.size / Array.from(stat.unique_participants).length) * 100
      : 0,
    approval_rate: stat.total_participations > 0
      ? (stat.approved_participations / stat.total_participations) * 100
      : 0
  }));

  // Remove the Set objects from the output
  const cleanResult = result.map(({ unique_participants, ...rest }) => rest);

  if (format === 'csv') {
    // Generate CSV for activities
    const activityCsvWriter = createObjectCsvWriter({
      path: 'social_report_activities.csv',
      header: [
        { id: 'title', title: 'Activity Title' },
        { id: 'category', title: 'Category' },
        { id: 'date', title: 'Date' },
        { id: 'department_name', title: 'Department' },
        { id: 'department_code', title: 'Dept Code' }
      ]
    });

    const activityData = activities.map(a => ({
      title: a.title,
      category: a.category.name,
      date: formatDate(a.date),
      department_name: a.department.name,
      department_code: a.department.code
    }));

    await activityCsvWriter.writeRecords(activityData);

    // Generate CSV for participations
    const participationCsvWriter = createObjectCsvWriter({
      path: 'social_report_participations.csv',
      header: [
        { id: 'employee_name', title: 'Employee Name' },
        { id: 'employee_email', title: 'Employee Email' },
        { id: 'activity_title', title: 'Activity Title' },
        { id: 'activity_date', title: 'Activity Date' },
        { id: 'approval_status', title: 'Approval Status' },
        { id: 'points_earned', title: 'Points Earned' }
      ]
    });

    const participationData = participations.map(p => ({
      employee_name: p.employee.name,
      employee_email: p.employee.email,
      activity_title: p.activity.title,
      activity_date: formatDate(p.activity.date),
      approval_status: p.approval_status,
      points_earned: p.points_earned || 0
    }));

    await participationCsvWriter.writeRecords(participationData);

    // In a real implementation, we'd zip these files or return both
    // For simplicity, we'll return the activities CSV
    res.download('social_report_activities.csv');
  } else {
    res.json({
      activities: activities,
      participations: participations,
      department_statistics: cleanResult
    });
  }
});

// @desc    Get governance report
// @route   GET /api/reports/governance
// @access  Private
const getGovernanceReport = asyncHandler(async (req, res) => {
  const { department, startDate, endDate, format = 'json' } = req.query;

  // Build filter for audits
  const auditFilter = {};
  if (department) auditFilter.department = department;
  if (startDate || endDate) {
    auditFilter.date = {};
    if (startDate) auditFilter.date.$gte = new Date(startDate);
    if (endDate) auditFilter.date.$lte = new Date(endDate);
  }

  // Get audits
  const audits = await Audit.find(auditFilter)
    .populate('department', 'name code')
    .populate('auditor', 'name email')
    .sort({ date: -1 });

  // Get compliance issues for these audits
  const auditIds = audits.map(a => a._id);
  const complianceIssues = await ComplianceIssue.find({ audit: { $in: auditIds } })
    .populate('audit', 'scope date department')
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

  // Get policy acknowledgements
  const policyAcknowledgements = await PolicyAcknowledgement.find({})
    .populate('employee', 'name email department')
    .populate('policy', 'title version')
    .sort({ acknowledged_date: -1 });

  // Calculate statistics by department
  const deptStats = {};

  // Initialize stats for departments found in audits
  audits.forEach(audit => {
    const deptId = audit.department._id.toString();
    if (!deptStats[deptId]) {
      deptStats[deptId] = {
        department: {
          _id: audit.department._id,
          name: audit.department.name,
          code: audit.department.code
        },
        audits: [],
        total_audits: 0,
        completed_audits: 0,
        compliance_issues: [],
        total_issues: 0,
        open_issues: 0,
        resolved_issues: 0,
        overdue_issues: 0
      };
    }
  });

  // Process audits
  audits.forEach(audit => {
    const deptId = audit.department._id.toString();
    if (deptStats[deptId]) {
      deptStats[deptId].audits.push({
        _id: audit._id,
        scope: audit.scope,
        date: audit.date,
        status: audit.status
      });
      deptStats[deptId].total_audits++;
      if (audit.status === 'completed') {
        deptStats[deptId].completed_audits++;
      }
    }
  });

  // Process compliance issues
  complianceIssues.forEach(issue => {
    const deptId = issue.audit.department._id.toString();
    if (deptStats[deptId]) {
      deptStats[deptId].compliance_issues.push({
        _id: issue._id,
        severity: issue.severity,
        description: issue.description,
        due_date: issue.due_date,
        status: issue.status
      });
      deptStats[deptId].total_issues++;
      if (issue.status === 'OPEN') {
        deptStats[deptId].open_issues++;
      }
      if (issue.status === 'RESOLVED') {
        deptStats[deptId].resolved_issues++;
      }
      // Check if overdue
      if (issue.status === 'OPEN' && issue.due_date < new Date()) {
        deptStats[deptId].overdue_issues++;
      }
    }
  });

  // Calculate rates and percentages
  const result = Object.values(deptStats).map(stat => ({
    ...stat,
    audit_completion_rate: stat.total_audits > 0
      ? (stat.completed_audits / stat.total_audits) * 100
      : 0,
    issue_resolution_rate: stat.total_issues > 0
      ? (stat.resolved_issues / stat.total_issues) * 100
      : 0
  }));

  // Remove unnecessary objects for cleaner output
  const cleanResult = result.map(({ audits, compliance_issues, ...rest }) => ({
    ...rest,
    audit_count: audits.length,
    recent_audits: audits.slice(0, 5).map(a => ({
      _id: a._id,
      scope: a.scope,
      date: a.date,
      status: a.status
    })),
    issue_count: compliance_issues.length,
    recent_issues: compliance_issues.slice(0, 5).map(i => ({
      _id: i._id,
      severity: i.severity,
      description: i.description.substring(0, 100) + '...',
      status: i.status
    }))
  }));

  if (format === 'csv') {
    // Generate CSV for auds
    const auditCsvWriter = createObjectCsvWriter({
      path: 'governance_report_audits.csv',
      header: [
        { id: 'department_name', title: 'Department' },
        { id: 'scope', title: 'Scope' },
        { id: 'date', title: 'Date' },
        { id: 'status', title: 'Status' },
        { id: 'auditor_name', title: 'Auditor' }
      ]
    });

    const auditData = audits.map(a => ({
      department_name: a.department.name,
      scope: a.scope,
      date: formatDate(a.date),
      status: a.status,
      auditor_name: a.auditor.name
    }));

    await auditCsvWriter.writeRecords(auditData);

    // Generate CSV for compliance issues
    const issueCsvWriter = createObjectCsvWriter({
      path: 'governance_report_issues.csv',
      header: [
        { id: 'department_name', title: 'Department' },
        { id: 'severity', title: 'Severity' },
        { id: 'description', title: 'Description' },
        { id: 'due_date', title: 'Due Date' },
        { id: 'status', title: 'Status' },
        { id: 'days_overdue', title: 'Days Overdue' }
      ]
    });

    const issueData = complianceIssues.map(i => {
      const daysOverdue = i.status === 'OPEN' && i.due_date < new Date()
        ? Math.ceil((new Date() - i.due_date) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        department_name: i.audit.department.name,
        severity: i.severity,
        description: i.description.substring(0, 50) + '...',
        due_date: formatDate(i.due_date),
        status: i.status,
        days_overdue: daysOverdue
      };
    });

    await issueCsvWriter.writeRecords(issueData);

    // Return audits CSV for simplicity
    res.download('governance_report_audits.csv');
  } else {
    res.json({
      audits: audits,
      compliance_issues: complianceIssues,
      policy_acknowledgements: policyAcknowledgements,
      department_statistics: result
    });
  }
});

// @desc    Get ESG summary report
// @route   GET /api/reports/esg-summary
// @access  Private
const getESGSummaryReport = asyncHandler(async (req, res) => {
  const { department, format = 'json' } = req.query;

  try {
    // Get ESG scores
    let deptScore;
    let orgScore;

    if (department) {
      // Get specific department score
      deptScore = await DepartmentScore.findOne({ department })
        .populate('department', 'name code');

      if (!deptScore) {
        // Calculate if not exists
        deptScore = await ScoringService.calculateAndUpdateDepartmentScore(department);
      }
    } else {
      // Get all department scores
      const deptScores = await DepartmentScore.find({})
        .populate('department', 'name code');

      // Calculate organizational score
      orgScore = await ScoringService.calculateOrganizationalESGScore();
    }

    // Get recent activities for context
    const recentActivities = await CSRActivity.find({})
      .sort({ date: -1 })
      .limit(5)
      .populate('department', 'name code')
      .populate('category', 'name');

    const recentIssues = await ComplianceIssue.find({ status: 'OPEN' })
      .sort({ due_date: 1 })
      .limit(5)
      .populate('audit', 'scope department')
      .populate('owner', 'name');

    const result = {
      timestamp: new Date().toISOString(),
      department: department ? {
        score: deptScore ? {
          environmental_score: deptScore.environmental_score,
          social_score: deptScore.social_score,
          governance_score: deptScore.governance_score,
          total_score: deptScore.total_score
        } : null
      } : null,
      organization: {
        score: orgScore
      },
      recent_activities: recentActivities.map(a => ({
        _id: a._id,
        title: a.title,
        department: a.department.name,
        date: a.date,
        category: a.category.name
      })),
      recent_open_issues: recentIssues.map(i => ({
        _id: i._id,
        description: i.description,
        severity: i.severity,
        due_date: i.due_date,
        department: i.audit.department.name,
        owner: i.owner.name
      }))
    };

    if (format === 'csv') {
      // For CSV, we'll create a simple summary
      const csvWriter = createObjectCsvWriter({
        path: 'esg_summary_report.csv',
        header: [
          { id: 'timestamp', title: 'Timestamp' },
          { id: 'scope', title: 'Scope' },
          { id: 'environmental_score', title: 'Environmental Score' },
          { id: 'social_score', title: 'Social Score' },
          { id: 'governance_score', title: 'Governance Score' },
          { id: 'total_score', title: 'Total Score' }
        ]
      });

      const csvData = [];

      if (department && deptScore) {
        csvData.push({
          timestamp: new Date().toISOString(),
          scope: `Department: ${deptScore.department.name}`,
          environmental_score: deptScore.environmental_score,
          social_score: deptScore.social_score,
          governance_score: deptScore.governance_score,
          total_score: deptScore.total_score
        });
      }

      csvData.push({
        timestamp: new Date().toISOString(),
        scope: 'Organization',
        environmental_score: 'N/A', // Would need to calculate
        social_score: 'N/A',
        governance_score: 'N/A',
        total_score: orgScore
      });

      await csvWriter.writeRecords(csvData);
      res.download('esg_summary_report.csv');
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Error generating ESG summary report:', error);
    res.status(500);
    throw new Error('Error generating ESG summary report');
  }
});

// @desc    Get custom report with flexible filtering
// @route   POST /api/reports/custom
// @access  Private
const getCustomReport = asyncHandler(async (req, res) => {
  const {
    entityType,
    filters,
    fields,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 50,
    format = 'json'
  } = req.body;

  // Map entity types to models
  const modelMap = {
    'users': User,
    'departments': Department,
    'carbon-transactions': CarbonTransaction,
    'csr-activities': CSRActivity,
    'employee-participation': EmployeeParticipation,
    'challenges': Challenge,
    'challenge-participation': ChallengeParticipation,
    'audits': Audit,
    'compliance-issues': ComplianceIssue,
    'policies': ESGPolicy,
    'policy-acknowledgements': PolicyAcknowledgement,
    'rewards': Reward,
    'reward-redemptions': RewardRedemption,
    'badges': Badge,
    'employee-badges': EmployeeBadge
  };

  const Model = modelMap[entityType];
  if (!Model) {
    res.status(400);
    throw new Error('Invalid entity type');
  }

  // Build query
  let query = {};

  // Apply filters
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        // Handle date ranges
        if (key.endsWith('_start') || key.endsWith('_from')) {
          const baseKey = key.substring(0, key.length - 6); // Remove '_start' or '_from'
          if (!query[baseKey]) query[baseKey] = {};
          query[baseKey].$gte = new Date(filters[key]);
        } else if (key.endsWith('_end') || key.endsWith('_to')) {
          const baseKey = key.substring(0, key.length - 4); // Remove '_end' or '_to'
          if (!query[baseKey]) query[baseKey] = {};
          query[baseKey].$lte = new Date(filters[key]);
        } else {
          // Handle exact matches and regex for text fields
          if (typeof filters[key] === 'string' && !key.includes('_id')) {
            // For text fields, use regex for partial matching
            query[key] = { $regex: filters[key], $options: 'i' };
          } else {
            query[key] = filters[key];
          }
        }
      }
    });
  }

  // Determine sort order
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [results, total] = await Promise.all([
    Model.find(query)
      .select(fields ? fields.split(',').join(' ') : null)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit)),
    Model.countDocuments(query)
  ]);

  if (format === 'csv' && results.length > 0) {
    // Convert to CSV
    // First, get all possible field names from the first document
    const sampleDoc = results[0].toObject ? results[0].toObject() : results[0];
    const fields = Object.keys(sampleDoc);

    // Create CSV header
    const csvHeader = fields.map(field => ({ id: field, title: field.replace(/_/g, ' ').toUpperCase() }));

    const csvWriter = createObjectCsvWriter({
      path: 'custom_report.csv',
      header: csvHeader
    });

    // Convert Mongoose docs to plain objects
    const csvData = results.map(doc => {
      const obj = doc.toObject ? doc.toObject() : doc;
      // Flatten any nested objects for simplicity (in real app, handle nested objects properly)
      const flattened = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          // Skip nested objects for CSV simplicity
          return;
        }
        flattened[key] = value;
      });
      return flattened;
    });

    await csvWriter.writeRecords(csvData);
    res.download('custom_report.csv');
  } else {
    res.json({
      results,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      filters: filters || {},
      sort: { [sortBy]: sortOrder }
    });
  }
});

export {
  getEnvironmentalReport,
  getSocialReport,
  getGovernanceReport,
  getESGSummaryReport,
  getCustomReport
};