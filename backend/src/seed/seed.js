import { connect, disconnect } from 'mongoose';
import { config } from 'dotenv';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Category from '../models/Category.js';
import EmissionFactor from '../models/EmissionFactor.js';
import ProductESGProfile from '../models/ProductESGProfile.js';
import EnvironmentalGoal from '../models/EnvironmentalGoal.js';
import ESGPolicy from '../models/ESGPolicy.js';
import Badge from '../models/Badge.js';
import Reward from '../models/Reward.js';
import FleetLog from '../models/FleetLog.js';
import PurchaseRecord from '../models/PurchaseRecord.js';
import ManufacturingRecord from '../models/ManufacturingRecord.js';
import ExpenseRecord from '../models/ExpenseRecord.js';
import CarbonTransaction from '../models/CarbonTransaction.js';
import CSRActivity from '../models/CSRActivity.js';
import EmployeeParticipation from '../models/EmployeeParticipation.js';
import Challenge from '../models/Challenge.js';
import ChallengeParticipation from '../models/ChallengeParticipation.js';
import PolicyAcknowledgement from '../models/PolicyAcknowledgement.js';
import Audit from '../models/Audit.js';
import ComplianceIssue from '../models/ComplianceIssue.js';
import DepartmentScore from '../models/DepartmentScore.js';
import UserBadge from '../models/UserBadge.js';
import EmployeeBadge from '../models/EmployeeBadge.js';
import RewardRedemption from '../models/RewardRedemption.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';
import { genSalt, hash } from 'bcryptjs';

config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecosphere', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Clear database
const clearDatabase = async () => {
  try {
    // Delete in order to avoid foreign key constraint issues
    await Notification.deleteMany({});
    await UserBadge.deleteMany({});
    await RewardRedemption.deleteMany({});
    await EmployeeBadge.deleteMany({});
    await DepartmentScore.deleteMany({});
    await ComplianceIssue.deleteMany({});
    await Audit.deleteMany({});
    await PolicyAcknowledgement.deleteMany({});
    await ChallengeParticipation.deleteMany({});
    await EmployeeParticipation.deleteMany({});
    await CSRActivity.deleteMany({});
    await CarbonTransaction.deleteMany({});
    await ExpenseRecord.deleteMany({});
    await ManufacturingRecord.deleteMany({});
    await PurchaseRecord.deleteMany({});
    await FleetLog.deleteMany({});
    await Reward.deleteMany({});
    await Badge.deleteMany({});
    await ESGPolicy.deleteMany({});
    await EnvironmentalGoal.deleteMany({});
    await ProductESGProfile.deleteMany({});
    await EmissionFactor.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await Department.deleteMany({});

    console.log('Database cleared');
  } catch (error) {
    console.error(`Error clearing database: ${error.message}`);
  }
};

// Create departments with hierarchy
const createDepartments = async () => {
  try {
    const departments = [
      {
        name: 'Corporate Headquarters',
        code: 'HQ',
        employee_count: 0
      },
      {
        name: 'Research & Development',
        code: 'R&D',
        employee_count: 0
      },
      {
        name: 'Marketing',
        code: 'MKT',
        employee_count: 0
      },
      {
        name: 'Sales',
        code: 'SALES',
        employee_count: 0
      },
      {
        name: 'Manufacturing',
        code: 'MFG',
        employee_count: 0
      },
      {
        name: 'Logistics',
        code: 'LOG',
        employee_count: 0
      }
    ];

    // Set up hierarchy: R&D, Marketing, Sales report to HQ; Manufacturing and Logistics report to HQ
    const createdDepartments = [];

    // Create all departments first
    for (const deptData of departments) {
      const dept = await Department.create(deptData);
      createdDepartments.push(dept);
      console.log(`Created department: ${dept.name}`);
    }

    // Set up hierarchy
    const hq = createdDepartments.find(d => d.code === 'HQ');
    const rd = createdDepartments.find(d => d.code === 'R&D');
    const mkt = createdDepartments.find(d => d.code === 'MKT');
    const sales = createdDepartments.find(d => d.code === 'SALES');
    const mfg = createdDepartments.find(d => d.code === 'MFG');
    const log = createdDepartments.find(d => d.code === 'LOG');

    if (hq && rd) rd.parent_department = hq._id;
    if (hq && mkt) mkt.parent_department = hq._id;
    if (hq && sales) sales.parent_department = hq._id;
    if (hq && mfg) mfg.parent_department = hq._id;
    if (hq && log) log.parent_department = hq._id;

    // Save updated departments
    await Promise.all([
      rd && rd.save(),
      mkt && mkt.save(),
      sales && sales.save(),
      mfg && mfg.save(),
      log && log.save()
    ]);

    // Update employee counts (will be updated when we create users)
    console.log('Departments created');
    return createdDepartments;
  } catch (error) {
    console.error(`Error creating departments: ${error.message}`);
    throw error;
  }
};

// Create users/employees
const createUsers = async (departments) => {
  try {
    const users = [
      {
        name: 'John Smith',
        email: 'john.smith@ecosphere.com',
        password: 'password123',
        role: 'admin',
        department: departments.find(d => d.code === 'HQ')._id
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@ecosphere.com',
        password: 'password123',
        role: 'manager',
        department: departments.find(d => d.code === 'R&D')._id
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@ecosphere.com',
        password: 'password123',
        role: 'manager',
        department: departments.find(d => d.code === 'MKT')._id
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@ecosphere.com',
        password: 'password123',
        role: 'employee',
        department: departments.find(d => d.code === 'SALES')._id
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@ecosphere.com',
        password: 'password123',
        role: 'employee',
        department: departments.find(d => d.code === 'MFG')._id
      },
      {
        name: 'Lisa Brown',
        email: 'lisa.brown@ecosphere.com',
        password: 'password123',
        role: 'employee',
        department: departments.find(d => d.code === 'LOG')._id
      },
      {
        name: 'Robert Taylor',
        email: 'robert.taylor@ecosphere.com',
        password: 'password123',
        role: 'employee',
        department: departments.find(d => d.code === 'HQ')._id
      },
      {
        name: 'Jennifer Garcia',
        email: 'jennifer.garcia@ecosphere.com',
        password: 'password123',
        role: 'employee',
        department: departments.find(d => d.code === 'R&D')._id
      },
      {
        name: 'Christopher Lee',
        email: 'christopher.lee@ecosphere.com',
        password: 'password123',
        role: 'employee',
        department: departments.find(d => d.code === 'MKT')._id
      },
      {
        name: 'Amanda Martinez',
        email: 'amanda.martinez@ecosphere.com',
        password: 'password123',
        role: 'employee',
        department: departments.find(d => d.code === 'SALES')._id
      }
    ];

    // Hash passwords and create users
    const createdUsers = [];
    for (const userData of users) {
      const salt = await genSalt(12);
      const hashedPassword = await hash(userData.password, salt);

      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password_hash: hashedPassword,
        role: userData.role,
        department: userData.department
      });

      createdUsers.push(user);
      console.log(`Created user: ${user.name}`);
    }

    // Update department employee counts
    const deptCounts = {};
    createdUsers.forEach(user => {
      const deptId = user.department.toString();
      deptCounts[deptId] = (deptCounts[deptId] || 0) + 1;
    });

    for (const [deptId, count] of Object.entries(deptCounts)) {
      await Department.findByIdAndUpdate(deptId, { employee_count: count });
    }

    console.log('Users created');
    return createdUsers;
  } catch (error) {
    console.error(`Error creating users: ${error.message}`);
    throw error;
  }
};

// Create categories
const createCategories = async () => {
  try {
    const categories = [
      { name: 'Community Service', type: 'CSR_ACTIVITY' },
      { name: 'Environmental Training', type: 'CSR_ACTIVITY' },
      { name: 'Energy Saving Challenge', type: 'CHALLENGE' },
      { name: 'Waste Reduction Challenge', type: 'CHALLENGE' },
      { name: 'Volunteer Hours', type: 'CSR_ACTIVITY' },
      { name: 'Innovation Challenge', type: 'CHALLENGE' }
    ];

    const createdCategories = [];
    for (const catData of categories) {
      const category = await Category.create(catData);
      createdCategories.push(category);
      console.log(`Created category: ${category.name}`);
    }

    console.log('Categories created');
    return createdCategories;
  } catch (error) {
    console.error(`Error creating categories: ${error.message}`);
    throw error;
  }
};

// Create emission factors
const createEmissionFactors = async () => {
  try {
    const factors = [
      { name: 'Diesel Fuel', category: 'FUEL_CONSUMPTION', unit: 'liters', co2_factor_value: 2.68 },
      { name: 'Gasoline', category: 'FUEL_CONSUMPTION', unit: 'liters', co2_factor_value: 2.31 },
      { name: 'Electricity', category: 'ENERGY_CONSUMPTION', unit: 'kWh', co2_factor_value: 0.5 },
      { name: 'Natural Gas', category: 'ENERGY_CONSUMPTION', unit: 'cubic meters', co2_factor_value: 1.8 },
      { name: 'Paper Products', category: 'PURCHASED_GOODS', unit: 'kg', co2_factor_value: 1.2 },
      { name: 'Plastic Products', category: 'PURCHASED_GOODS', unit: 'kg', co2_factor_value: 3.5 },
      { name: 'Manufacturing Process A', category: 'MANUFACTURING_PROCESS', unit: 'units', co2_factor_value: 0.1 },
      { name: 'Manufacturing Process B', category: 'MANUFACTURING_PROCESS', unit: 'units', co2_factor_value: 0.2 },
      { name: 'Travel Expenses', category: 'EXPENSE', unit: 'dollars', co2_factor_value: 0.15 },
      { name: 'Office Supplies', category: 'EXPENSE', unit: 'dollars', co2_factor_value: 0.05 }
    ];

    const createdFactors = [];
    for (const factorData of factors) {
      const factor = await EmissionFactor.create(factorData);
      createdFactors.push(factor);
      console.log(`Created emission factor: ${factor.name}`);
    }

    console.log('Emission factors created');
    return createdFactors;
  } catch (error) {
    console.error(`Error creating emission factors: ${error.message}`);
    throw error;
  }
};

// Create fake source records for auto emission calculation
const createSourceRecords = async (departments) => {
  try {
    const sourceRecords = [];

    // Create FleetLog entries
    for (let i = 0; i < 5; i++) {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const fleetLog = await FleetLog.create({
        department: dept._id,
        fuel_liters: Math.floor(Math.random() * 100) + 50,
        distance_km: Math.floor(Math.random() * 500) + 100,
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      });
      sourceRecords.push(fleetLog);
      console.log(`Created fleet log: ${fleetLog.fuel_liters} liters`);
    }

    // Create PurchaseRecord entries
    for (let i = 0; i < 5; i++) {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const purchaseRecord = await PurchaseRecord.create({
        department: dept._id,
        item_category: ['Paper Products', 'Plastic Products'][Math.floor(Math.random() * 2)],
        quantity: Math.floor(Math.random() * 200) + 50,
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      });
      sourceRecords.push(purchaseRecord);
      console.log(`Created purchase record: ${purchaseRecord.quantity} ${purchaseRecord.item_category}`);
    }

    // Create ManufacturingRecord entries
    for (let i = 0; i < 5; i++) {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const manufacturingRecord = await ManufacturingRecord.create({
        department: dept._id,
        process_type: ['Process A', 'Process B'][Math.floor(Math.random() * 2)],
        output_units: Math.floor(Math.random() * 1000) + 500,
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      });
      sourceRecords.push(manufacturingRecord);
      console.log(`Created manufacturing record: ${manufacturingRecord.output_units} units`);
    }

    // Create ExpenseRecord entries
    for (let i = 0; i < 5; i++) {
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const expenseRecord = await ExpenseRecord.create({
        department: dept._id,
        expense_type: ['Travel Expenses', 'Office Supplies'][Math.floor(Math.random() * 2)],
        amount: Math.floor(Math.random() * 1000) + 100,
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      });
      sourceRecords.push(expenseRecord);
      console.log(`Created expense record: $${expenseRecord.amount} ${expenseRecord.expense_type}`);
    }

    console.log('Source records created');
    return sourceRecords;
  } catch (error) {
    console.error(`Error creating source records: ${error.message}`);
    throw error;
  }
};

// Create CSR activities
const createCSRActivities = async (departments, categories) => {
  try {
    const activities = [
      {
        title: 'Community Clean-up Day',
        category: categories.find(c => c.name === 'Community Service')._id,
        department: departments.find(d => d.code === 'HQ')._id,
        description: 'Employees volunteered to clean up local parks and waterways',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      {
        title: 'Environmental Training Workshop',
        category: categories.find(c => c.name === 'Environmental Training')._id,
        department: departments.find(d => d.code === 'R&D')._id,
        description: 'Training session on sustainable practices in the workplace',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      {
        title: 'Food Bank Volunteer Drive',
        category: categories.find(c => c.name === 'Volunteer Hours')._id,
        department: departments.find(d => d.code === 'MKT')._id,
        description: 'Team volunteered at local food bank to sort and distribute donations',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        title: 'Recycling Initiative Launch',
        category: categories.find(c => c.name === 'Environmental Training')._id,
        department: departments.find(d => d.code === 'MFG')._id,
        description: 'Launch of comprehensive recycling program across all facilities',
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      }
    ];

    const createdActivities = [];
    for (const activityData of activities) {
      const activity = await CSRActivity.create(activityData);
      createdActivities.push(activity);
      console.log(`Created CSR activity: ${activity.title}`);
    }

    console.log('CSR activities created');
    return createdActivities;
  } catch (error) {
    console.error(`Error creating CSR activities: ${error.message}`);
    throw error;
  }
};

// Create challenges
const createChallenges = async (categories) => {
  try {
    const challenges = [
      {
        title: 'Energy Reduction Challenge',
        category: categories.find(c => c.name === 'Energy Saving Challenge')._id,
        description: 'Reduce energy consumption in your workspace by 20% over one month',
        xp_value: 150,
        difficulty: 'MEDIUM',
        evidence_required: true,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'ACTIVE'
      },
      {
        title: 'Zero Waste Week',
        category: categories.find(c => c.name === 'Waste Reduction Challenge')._id,
        description: 'Aim to produce zero landfill waste for one work week',
        xp_value: 200,
        difficulty: 'HARD',
        evidence_required: true,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: 'ACTIVE'
      },
      {
        title: 'Paperless Office Challenge',
        category: categories.find(c => c.name === 'Innovation Challenge')._id,
        description: 'Transition to digital workflows and reduce paper usage by 80%',
        xp_value: 100,
        difficulty: 'EASY',
        evidence_required: false,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        status: 'UNDER_REVIEW'
      },
      {
        title: 'Carpool Challenge',
        category: categories.find(c => c.name === 'Energy Saving Challenge')._id,
        description: 'Share rides to work to reduce carbon emissions from commuting',
        xp_value: 120,
        difficulty: 'MEDIUM',
        evidence_required: true,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        status: 'DRAFT'
      }
    ];

    const createdChallenges = [];
    for (const challengeData of challenges) {
      const challenge = await Challenge.create(challengeData);
      createdChallenges.push(challenge);
      console.log(`Created challenge: ${challenge.title}`);
    }

    console.log('Challenges created');
    return createdChallenges;
  } catch (error) {
    console.error(`Error creating challenges: ${error.message}`);
    throw error;
  }
};

// Create badges
const createBadges = async () => {
  try {
    const badges = [
      {
        name: 'Eco Warrior',
        description: 'Earned for achieving high XP through sustainable actions',
        unlock_rule: { type: 'xp_gte', value: 500 },
        icon_url: 'https://example.com/badges/eco-warrior.png'
      },
      {
        name: 'Challenge Master',
        description: 'Earned for completing multiple challenges',
        unlock_rule: { type: 'challenges_completed_gte', value: 3 },
        icon_url: 'https://example.com/badges/challenge-master.png'
      },
      {
        name: 'Points Champion',
        description: 'Earned for accumulating reward points',
        unlock_rule: { type: 'points_balance_gte', value: 1000 },
        icon_url: 'https://example.com/badges/points-champion.png'
      },
      {
        name: 'Green Team Player',
        description: 'Earned for participating in CSR activities',
        unlock_rule: { type: 'xp_gte', value: 200 },
        icon_url: 'https://example.com/badges/green-team.png'
      }
    ];

    const createdBadges = [];
    for (const badgeData of badges) {
      const badge = await Badge.create(badgeData);
      createdBadges.push(badge);
      console.log(`Created badge: ${badge.name}`);
    }

    console.log('Badges created');
    return createdBadges;
  } catch (error) {
    console.error(`Error creating badges: ${error.message}`);
    throw error;
  }
};

// Create rewards
const createRewards = async () => {
  try {
    const rewards = [
      {
        name: 'Reusable Water Bottle',
        description: 'Eco-friendly stainless steel water bottle',
        points_required: 100,
        stock: 50
      },
      {
        name: 'Bamboo Cutlery Set',
        description: 'Reusable bamboo fork, knife, and spoon set',
        points_required: 150,
        stock: 30
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Sustainable fashion tee made from organic cotton',
        points_required: 200,
        stock: 25
      },
      {
        name: 'Solar Power Bank',
        description: 'Portable solar charger for mobile devices',
        points_required: 500,
        stock: 10
      },
      {
        name: 'Extra Vacation Day',
        description: 'Additional paid day off to use as you wish',
        points_required: 1000,
        stock: 5
      }
    ];

    const createdRewards = [];
    for (const rewardData of rewards) {
      const reward = await Reward.create(rewardData);
      createdRewards.push(reward);
      console.log(`Created reward: ${reward.name}`);
    }

    console.log('Rewards created');
    return createdRewards;
  } catch (error) {
    console.error(`Error creating rewards: ${error.message}`);
    throw error;
  }
};

// Create policies
const createPolicies = async () => {
  try {
    const policies = [
      {
        title: 'Sustainable Procurement Policy',
        description: 'Guidelines for purchasing environmentally friendly products and services',
        version: '1.0',
        effective_date: new Date('2024-01-01')
      },
      {
        title: 'Remote Work Policy',
        description: 'Policy governing remote work arrangements to reduce commuting emissions',
        version: '2.1',
        effective_date: new Date('2024-03-15')
      },
      {
        title: 'Waste Management and Recycling Policy',
        description: 'Procedures for proper waste segregation, recycling, and reduction',
        version: '1.2',
        effective_date: new Date('2024-02-01')
      }
    ];

    const createdPolicies = [];
    for (const policyData of policies) {
      const policy = await ESGPolicy.create(policyData);
      createdPolicies.push(policy);
      console.log(`Created policy: ${policy.title}`);
    }

    console.log('Policies created');
    return createdPolicies;
  } catch (error) {
    console.error(`Error creating policies: ${error.message}`);
    throw error;
  }
};

// Create some user participations and challenge participations
const createParticipations = async (users, activities, challenges) => {
  try {
    // Create some employee participations in CSR activities
    const csrParticipations = [];
    for (let i = 0; i < 8; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const activity = activities[Math.floor(Math.random() * activities.length)];

      // Check if participation already exists
      const existing = await EmployeeParticipation.findOne({ employee: user._id, activity: activity._id });
      if (!existing) {
        const participation = await EmployeeParticipation.create({
          employee: user._id,
          activity: activity._id,
          proof_file_url: `https://example.com/proofs/participation-${i+1}.pdf`,
          approval_status: Math.random() > 0.3 ? 'APPROVED' : 'PENDING', // 70% approved
          points_earned: Math.random() > 0.3 ? 10 : 0,
          completion_date: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
        });

        // Update user points and XP if approved
        if (participation.approval_status === 'APPROVED') {
          user.points_balance += participation.points_earned;
          user.xp_total += participation.points_earned;
          await user.save();
        }

        csrParticipations.push(participation);
        console.log(`Created CSR participation: ${user.name} - ${activity.title}`);
      }
    }

    // Create some challenge participations
    const challengeParticipations = [];
    for (let i = 0; i < 6; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const challenge = challenges[Math.floor(Math.random() * challenges.length)];

      // Check if participation already exists
      const existing = await ChallengeParticipation.findOne({ employee: user._id, challenge: challenge._id });
      if (!existing) {
        const participation = await ChallengeParticipation.create({
          challenge: challenge._id,
          employee: user._id,
          progress: Math.floor(Math.random() * 101),
          proof_file_url: Math.random() > 0.5 ? `https://example.com/proofs/challenge-${i+1}.pdf` : null,
          approval_status: Math.random() > 0.4 ? 'APPROVED' : 'PENDING', // 60% approved
          xp_awarded: Math.random() > 0.4 ? challenge.xp_value : 0
        });

        // Update user points and XP if approved
        if (participation.approval_status === 'APPROVED') {
          user.points_balance += participation.xp_awarded;
          user.xp_total += participation.xp_awarded;
          await user.save();
        }

        challengeParticipations.push(participation);
        console.log(`Created challenge participation: ${user.name} - ${challenge.title}`);
      }
    }

    console.log('Participations created');
    return { csrParticipations, challengeParticipations };
  } catch (error) {
    console.error(`Error creating participations: ${error.message}`);
    throw error;
  }
};

// Create some policy acknowledgements
const createPolicyAcknowledgements = async (users, policies) => {
  try {
    const acknowledgements = [];

    // Have some users acknowledge some policies
    for (let i = 0; i < policies.length; i++) {
      // Randomly select users to acknowledge each policy
      const numAcknowledgements = Math.floor(Math.random() * users.length) + 1;
      const selectedUsers = [];

      // Select random unique users
      while (selectedUsers.length < numAcknowledgements && selectedUsers.length < users.length) {
        const randomIndex = Math.floor(Math.random() * users.length);
        const user = users[randomIndex];
        if (!selectedUsers.includes(user)) {
          selectedUsers.push(user);
        }
      }

      for (const user of selectedUsers) {
        // Check if acknowledgement already exists
        const existing = await PolicyAcknowledgement.findOne({ employee: user._id, policy: policies[i]._id });
        if (!existing) {
          const acknowledgement = await PolicyAcknowledgement.create({
            employee: user._id,
            policy: policies[i]._id,
            acknowledged_date: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000)
          });

          acknowledgements.push(acknowledgement);
          console.log(`Created policy acknowledgement: ${user.name} - ${policies[i].title}`);
        }
      }
    }

    console.log('Policy acknowledgements created');
    return acknowledgements;
  } catch (error) {
    console.error(`Error creating policy acknowledgements: ${error.message}`);
    throw error;
  }
};

// Create some audits and compliance issues
const createAuditsAndIssues = async (departments, users) => {
  try {
    // Create audits
    const audits = [
      {
        department: departments.find(d => d.code === 'MFG')._id,
        scope: 'Environmental compliance review of manufacturing processes',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        auditor: users.find(u => u.email === 'sarah.johnson@ecosphere.com')._id,
        status: 'completed'
      },
      {
        department: departments.find(d => d.code === 'LOG')._id,
        scope: 'Operational safety and emissions audit',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        auditor: users.find(u => u.email === 'michael.chen@ecosphere.com')._id,
        status: 'completed'
      },
      {
        department: departments.find(d => d.code === 'HQ')._id,
        scope: 'Corporate governance and ESG reporting audit',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        auditor: users.find(u => u.email === 'john.smith@ecosphere.com')._id,
        status: 'completed'
      }
    ];

    const createdAudits = [];
    for (const auditData of audits) {
      const audit = await Audit.create(auditData);
      createdAudits.push(audit);
      console.log(`Created audit: ${audit.scope}`);
    }

    // Create compliance issues
    const issues = [
      {
        audit: createdAudits[0]._id,
        severity: 'MEDIUM',
        description: 'Inadequate labeling of hazardous materials in storage area B',
        owner: users.find(u => u.email === 'david.wilson@ecosphere.com')._id,
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'OPEN'
      },
      {
        audit: createdAudits[1]._id,
        severity: 'HIGH',
        description: 'Vehicle maintenance records incomplete for last 3 months',
        owner: users.find(u => u.email === 'lisa.brown@ecosphere.com')._id,
        due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (OVERDUE)
        status: 'OPEN'
      },
      {
        audit: createdAudits[2]._id,
        severity: 'LOW',
        description: 'Missing documentation for quarterly ESG metrics',
        owner: users.find(u => u.email === 'robert.taylor@ecosphere.com')._id,
        due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        status: 'RESOLVED'
      }
    ];

    const createdIssues = [];
    for (const issueData of issues) {
      const issue = await ComplianceIssue.create(issueData);
      createdIssues.push(issue);
      console.log(`Created compliance issue: ${issue.severity} - ${issue.description.substring(0, 30)}...`);
    }

    console.log('Audits and compliance issues created');
    return { audits: createdAudits, issues: createdIssues };
  } catch (error) {
    console.error(`Error creating audits and compliance issues: ${error.message}`);
    throw error;
  }
};

// Create some badges awards
const createBadgeAwards = async (users, badges) => {
  try {
    const awards = [];

    // Award some badges to users who meet criteria
    for (const user of users) {
      // Check if user has enough XP for Eco Warrior badge (500 XP)
      const ecoWarriorBadge = badges.find(b => b.name === 'Eco Warrior');
      if (ecoWarriorBadge && user.xp_total >= 500) {
        const existing = await UserBadge.findOne({ employee: user._id, badge: ecoWarriorBadge._id });
        if (!existing) {
          const award = await UserBadge.create({
            employee: user._id,
            badge: ecoWarriorBadge._id
          });
          awards.push(award);
          console.log(`Awarded Eco Warrior badge to: ${user.name}`);
        }
      }

      // Check if user has completed enough challenges for Challenge Master badge (3 challenges)
      const challengeMasterBadge = badges.find(b => b.name === 'Challenge Master');
      if (challengeMasterBadge) {
        // Count approved challenges for this user
        const completedChallengesCount = await ChallengeParticipation.countDocuments({
          employee: user._id,
          approval_status: 'APPROVED'
        });

        if (completedChallengesCount >= 3) {
          const existing = await UserBadge.findOne({ employee: user._id, badge: challengeMasterBadge._id });
          if (!existing) {
            const award = await UserBadge.create({
              employee: user._id,
              badge: challengeMasterBadge._id
            });
            awards.push(award);
            console.log(`Awarded Challenge Master badge to: ${user.name}`);
          }
        }
      }
    }

    console.log('Badge awards created');
    return awards;
  } catch (error) {
    console.error(`Error creating badge awards: ${error.message}`);
    throw error;
  }
};

// Create some reward redemptions
const createRewardRedemptions = async (users, rewards) => {
  try {
    const redemptions = [];

    // Have some users redeem rewards
    for (let i = 0; i < Math.min(3, users.length); i++) {
      const user = users[i];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];

      // Check if user has enough points
      if (user.points_balance >= reward.points_required) {
        // Create redemption
        const redemption = await RewardRedemption.create({
          user: user._id,
          reward: reward._id,
          points_spent: reward.points_required
        });

        // Update user points and reward stock
        user.points_balance -= reward.points_required;
        reward.stock -= 1;
        if (reward.stock === 0) {
          reward.status = 'out_of_stock';
        }

        await Promise.all([user.save(), reward.save()]);

        redemptions.push(redemption);
        console.log(`Created reward redemption: ${user.name} redeemed ${reward.name}`);
      }
    }

    console.log('Reward redemptions created');
    return redemptions;
  } catch (error) {
    console.error(`Error creating reward redemptions: ${error.message}`);
    throw error;
  }
};

// Create default settings
const createSettings = async () => {
  try {
    let settings = await Settings.findOne({});

    if (!settings) {
      settings = await Settings.create({
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

      console.log('Default settings created');
    }

    return settings;
  } catch (error) {
    console.error(`Error creating settings: ${error.message}`);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Connect to database
    await connectDB();

    // Clear existing data
    await clearDatabase();

    // Create core data
    const departments = await createDepartments();
    const users = await createUsers(departments);
    const categories = await createCategories();
    const emissionFactors = await createEmissionFactors();

    // Create source records for auto emission calculation
    const sourceRecords = await createSourceRecords(departments);

    // Create activities and challenges
    const activities = await createCSRActivities(departments, categories);
    const challenges = await createChallenges(categories);

    // Create badges and rewards
    const badges = await createBadges();
    const rewards = await createRewards();

    // Create policies
    const policies = await createPolicies();

    // Create participations
    const participations = await createParticipations(users, activities, challenges);

    // Create policy acknowledgements
    const acknowledgements = await createPolicyAcknowledgements(users, policies);

    // Create audits and compliance issues
    const auditResults = await createAuditsAndIssues(departments, users);

    // Create badge awards
    const badgeAwards = await createBadgeAwards(users, badges);

    // Create reward redemptions
    const rewardRedemptions = await createRewardRedemptions(users, rewards);

    // Create settings
    const settings = await createSettings();

    // Process auto emission calculation
    console.log('Processing auto emission calculation...');
    const AutoEmissionService = require('../utils/autoEmissionService').default;
    const emissionResult = await AutoEmissionService.processAllSourceRecords();
    console.log(`Auto emission processing: ${emissionResult.message}`);

    // Calculate initial department scores
    console.log('Calculating initial department scores...');
    const ScoringService = require('../utils/scoringService').default;
    for (const dept of departments) {
      await ScoringService.calculateAndUpdateDepartmentScore(dept._id);
    }

    console.log('Database seeding completed successfully!');
    console.log(`Created:`);
    console.log(`- ${departments.length} departments`);
    console.log(`- ${users.length} users`);
    console.log(`- ${categories.length} categories`);
    console.log(`- ${emissionFactors.length} emission factors`);
    console.log(`- ${sourceRecords.length} source records`);
    console.log(`- ${activities.length} CSR activities`);
    console.log(`- ${challenges.length} challenges`);
    console.log(`- ${badges.length} badges`);
    console.log(`- ${rewards.length} rewards`);
    console.log(`- ${policies.length} policies`);
    console.log(`- ${participations.csrParticipations.length + participations.challengeParticipations.length} participations`);
    console.log(`- ${acknowledgements.length} policy acknowledgements`);
    console.log(`- ${auditResults.issues.length} compliance issues (${auditResults.audits.length} audits)`);
    console.log(`- ${badgeAwards.length} badge awards`);
    console.log(`- ${rewardRedemptions.length} reward redemptions`);

    // Disconnect from database
    await disconnect();
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    await disconnect();
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();