import type {
  AuthResponse,
  Badge,
  Challenge,
  ComplianceIssue,
  CSRActivity,
  Audit,
  ESGPolicy,
  EnvironmentalReport,
  GovernanceReport,
  LeaderboardEntry,
  Notification,
  OrgEsgScore,
  Reward,
  SocialReport,
  User,
} from '../types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockUser: User = {
  id: 'usr-001',
  name: 'Alex Rivera',
  email: 'alex@ecosphere.io',
  department: 'dep-001',
  role: 'admin',
  status: 'active',
  xp_total: 84200,
  points_balance: 12400,
};

export const mockAuthResponse: AuthResponse = {
  user: mockUser,
  token: 'mock-jwt-token-xxxxxxxxxxxx',
};

export const mockOrgEsgScore: OrgEsgScore = {
  environmental_score: 82,
  social_score: 74,
  governance_score: 79,
  total_score: 78.4,
  grade: 'A-',
  trend: 3.2,
  rank: 'Top 8%',
};

export const mockEnvironmentalReport: EnvironmentalReport = {
  scope1: 18420,
  scope2: 22100,
  scope3: 102330,
  offset: 142850,
  net: -3170,
  monthly: [62, 58, 55, 51, 48, 44, 41, 38, 34, 31, 29, 27],
  renewable: 68,
  fossil: 32,
  energySources: [
    { label: 'Solar', value: 38, color: '#52B788' },
    { label: 'Wind', value: 22, color: '#2D6A4F' },
    { label: 'Hydro', value: 8, color: '#40916C' },
    { label: 'Fossil', value: 32, color: '#6B7280' },
  ],
  sustainabilityGoals: [
    { title: 'Net-Zero by 2030', progress: 84, status: 'Ahead', target: '0 tCO₂e', current: '−3,170 tCO₂e' },
    { title: '100% Renewable Energy', progress: 68, status: 'On Track', target: '100%', current: '68%' },
    { title: 'Zero Waste to Landfill', progress: 87, status: 'On Track', target: '0%', current: '12.7%' },
    { title: 'Water Neutral Operations', progress: 52, status: 'At Risk', target: '100%', current: '52%' },
  ],
  departmentScores: [
    { dept: 'Manufacturing', score: 78, trend: 4 },
    { dept: 'Logistics', score: 71, trend: 2 },
    { dept: 'R&D', score: 89, trend: 6 },
    { dept: 'Corporate', score: 85, trend: 3 },
    { dept: 'Retail Ops', score: 76, trend: 1 },
  ],
  reports: [
    { title: 'Annual Carbon Footprint', framework: 'GHG Protocol', date: '2026-06-12', status: 'Published' },
    { title: 'Renewable Energy Transition', framework: 'Internal', date: '2026-05-28', status: 'Published' },
    { title: 'Water Stewardship Audit', framework: 'CDP Water', date: '2026-07-01', status: 'In Review' },
    { title: 'Waste Reduction Strategy', framework: 'Internal', date: '2026-06-20', status: 'Draft' },
  ],
};

export const mockSocialReport: SocialReport = {
  csrActivities: [
    { title: 'Community Tree Planting', participants: 1240, hours: 4200, impact: '8,900 trees', status: 'Active' },
    { title: 'Beach Cleanup Drive', participants: 860, hours: 2100, impact: '12 tonnes removed', status: 'Active' },
    { title: 'STEM Mentorship Program', participants: 320, hours: 6800, impact: '540 students', status: 'Active' },
    { title: 'Food Bank Volunteering', participants: 540, hours: 3200, impact: '28k meals', status: 'Completed' },
  ],
  participation: {
    rate: 74,
    totalEmployees: 8400,
    activeParticipants: 6216,
    avgHoursPerEmployee: 4.6,
    trend: [52, 58, 62, 65, 68, 70, 72, 74],
  },
  challenges: [
    { id: 'ch-1', title: 'Carbon Diet Challenge', category: 'cat-1', description: 'Reduce personal footprint by 20%', xp_value: 500, difficulty: 'MEDIUM', evidence_required: false, deadline: '2026-07-24', status: 'ACTIVE', participants: 1840, progress: 64 },
    { id: 'ch-2', title: 'Green Commute Week', category: 'cat-1', description: 'Bike, walk or transit for 5 days', xp_value: 300, difficulty: 'EASY', evidence_required: false, deadline: '2026-07-17', status: 'ACTIVE', participants: 2120, progress: 78 },
    { id: 'ch-3', title: 'Energy Saver Sprint', category: 'cat-1', description: 'Cut office energy use by 15%', xp_value: 400, difficulty: 'HARD', evidence_required: true, deadline: '2026-08-01', status: 'ACTIVE', participants: 960, progress: 41 },
  ],
  xp: { total: 84200, level: 12, nextLevel: 90000, weekly: 1240, rank: 'Forest Guardian' },
  badges: [
    { id: 'b-1', name: 'First Seed', description: 'Join your first CSR activity', unlock_rule: { type: 'csr_count', value: 1 }, icon: 'sprout', earned: true, rarity: 'Common' },
    { id: 'b-2', name: 'Carbon Cutter', description: 'Reduce carbon footprint by 10%', unlock_rule: { type: 'carbon_reduction', value: 10 }, icon: 'leaf', earned: true, rarity: 'Rare' },
    { id: 'b-3', name: 'Eco Warrior', description: 'Complete 5 challenges', unlock_rule: { type: 'challenges', value: 5 }, icon: 'shield', earned: true, rarity: 'Epic' },
    { id: 'b-4', name: 'Community Builder', description: '100 community volunteer hours', unlock_rule: { type: 'volunteer_hours', value: 100 }, icon: 'users', earned: true, rarity: 'Rare' },
    { id: 'b-5', name: 'Energy Sage', description: 'Reduce energy use by 20%', unlock_rule: { type: 'energy_reduction', value: 20 }, icon: 'zap', earned: true, rarity: 'Rare' },
    { id: 'b-6', name: 'Water Guardian', description: 'Save 1000 liters of water', unlock_rule: { type: 'water_saved', value: 1000 }, icon: 'droplet', earned: true, rarity: 'Epic' },
    { id: 'b-7', name: 'Net-Zero Hero', description: 'Achieve net-zero carbon', unlock_rule: { type: 'net_zero', value: 1 }, icon: 'award', earned: false, rarity: 'Legendary' },
    { id: 'b-8', name: 'Forest Sage', description: 'Reach level 20', unlock_rule: { type: 'level', value: 20 }, icon: 'tree', earned: false, rarity: 'Legendary' },
  ],
  leaderboard: [
    { rank: 1, name: 'Maya Chen', dept: 'R&D', xp: 12480, avatar: 'MC' },
    { rank: 2, name: 'Liam Park', dept: 'Manufacturing', xp: 11200, avatar: 'LP' },
    { rank: 3, name: 'Sara Okafor', dept: 'Corporate', xp: 10940, avatar: 'SO' },
    { rank: 4, name: 'Diego Ruiz', dept: 'Logistics', xp: 9870, avatar: 'DR' },
    { rank: 5, name: 'Yuki Tanaka', dept: 'Retail Ops', xp: 9210, avatar: 'YT' },
  ],
};

export const mockGovernanceReport: GovernanceReport = {
  complianceScore: 99.2,
  frameworks: [
    { name: 'GDPR', status: 'Compliant', lastAudit: '2026-05-10' },
    { name: 'SOX', status: 'Compliant', lastAudit: '2026-03-22' },
    { name: 'ISO 27001', status: 'Compliant', lastAudit: '2026-04-18' },
    { name: 'SOC 2', status: 'Compliant', lastAudit: '2026-06-05' },
    { name: 'EU CSRD', status: 'In Progress', lastAudit: '2026-07-01' },
  ],
  trainingCompletion: 98.6,
  policyReviews: 23,
  policies: [
    { id: 'p-1', title: 'Code of Conduct', description: 'Ethical guidelines for all employees', version: '3.2', effective_date: '2026-03-15', category: 'Ethics', reviewed: '2026-03-15', status: 'Current', coverage: 100 },
    { id: 'p-2', title: 'Anti-Corruption Policy', description: 'Zero tolerance anti-corruption framework', version: '2.1', effective_date: '2026-02-20', category: 'Ethics', reviewed: '2026-02-20', status: 'Current', coverage: 100 },
    { id: 'p-3', title: 'Whistleblower Protection', description: 'Reporting and protection framework', version: '1.8', effective_date: '2025-11-08', category: 'Ethics', reviewed: '2025-11-08', status: 'Current', coverage: 98 },
    { id: 'p-4', title: 'Data Privacy Framework', description: 'GDPR-compliant data handling', version: '4.0', effective_date: '2026-01-12', category: 'Privacy', reviewed: '2026-01-12', status: 'Current', coverage: 100 },
    { id: 'p-5', title: 'Sustainable Sourcing Policy', description: 'Green procurement guidelines', version: '2.3', effective_date: '2025-09-30', category: 'Supply Chain', reviewed: '2025-09-30', status: 'Review Due', coverage: 84 },
    { id: 'p-6', title: 'Diversity & Inclusion Charter', description: 'DEI commitments and practices', version: '3.0', effective_date: '2026-04-02', category: 'Social', reviewed: '2026-04-02', status: 'Current', coverage: 96 },
  ],
  audits: [
    { id: 'a-1', department: 'Corporate', scope: 'Q2 Financial Audit', date: '2026-06-30', auditor: 'Internal Team', status: 'completed', type: 'Internal', findings: 2 },
    { id: 'a-2', department: 'IT', scope: 'ISO 27001 Recertification', date: '2026-04-18', auditor: 'Bureau Veritas', status: 'completed', type: 'External', findings: 0 },
    { id: 'a-3', department: 'Procurement', scope: 'Supply Chain ESG Audit', date: '2026-07-20', auditor: 'ERM Corp', status: 'in_progress', type: 'External', findings: 0 },
    { id: 'a-4', department: 'IT', scope: 'Data Privacy Impact Assessment', date: '2026-08-15', auditor: 'Internal Team', status: 'scheduled', type: 'Internal', findings: 0 },
    { id: 'a-5', department: 'HR', scope: 'Whistleblower System Review', date: '2026-05-28', auditor: 'Internal Team', status: 'completed', type: 'Internal', findings: 1 },
  ],
  issues: [
    { id: 'i-1', audit: 'a-3', severity: 'MEDIUM', description: 'Supplier ESG disclosure gap', title: 'Supplier ESG disclosure gap', owner: 'usr-002', assignee: 'Procurement', due_date: '2026-08-15', status: 'OPEN', age: 12 },
    { id: 'i-2', audit: 'a-3', severity: 'HIGH', description: 'CSRD reporting framework migration', title: 'CSRD reporting framework migration', owner: 'usr-003', assignee: 'Finance', due_date: '2026-09-01', status: 'IN_PROGRESS', age: 34 },
    { id: 'i-3', audit: 'a-5', severity: 'LOW', description: 'Policy review overdue (Sourcing)', title: 'Policy review overdue (Sourcing)', owner: 'usr-004', assignee: 'Legal', due_date: '2026-07-30', status: 'OPEN', age: 5 },
    { id: 'i-4', audit: 'a-1', severity: 'MEDIUM', description: 'Board diversity target gap', title: 'Board diversity target gap', owner: 'usr-005', assignee: 'Nomination Cmte', due_date: '2026-10-01', status: 'IN_PROGRESS', age: 21 },
  ],
};

export const mockRewards: Reward[] = [
  { id: 'rw-1', name: 'Extra PTO Day', description: 'One additional paid day off', points_required: 5000, stock: 50, status: 'active', icon: 'calendar', available: true },
  { id: 'rw-2', name: 'EcoSphere Hoodie', description: 'Premium branded hoodie', points_required: 8000, stock: 25, status: 'active', icon: 'shirt', available: true },
  { id: 'rw-3', name: 'Tree Planted in Your Name', description: 'A tree planted and tracked', points_required: 3000, stock: 999, status: 'active', icon: 'tree', available: true },
  { id: 'rw-4', name: 'Charity Donation ($100)', description: 'Donate $100 to a charity of choice', points_required: 6000, stock: 100, status: 'active', icon: 'heart', available: true },
  { id: 'rw-5', name: 'Lunch with Leadership', description: 'Exclusive lunch with execs', points_required: 12000, stock: 10, status: 'active', icon: 'utensils', available: true },
  { id: 'rw-6', name: 'Carbon Offset Certificate', description: 'Official carbon offset certificate', points_required: 4000, stock: 0, status: 'out_of_stock', icon: 'award', available: false },
];

export const mockNotifications: Notification[] = [
  { id: 'n-1', type: 'policy_acknowledgement_reminder', title: 'CSRD report deadline approaching', message: '15 days remaining', detail: '15 days remaining', is_read: false, time: '1h ago', notificationType: 'warning' },
  { id: 'n-2', type: 'new_compliance_issue', title: 'New policy review assigned', message: 'Sustainable Sourcing Policy', detail: 'Sustainable Sourcing Policy', is_read: false, time: '4h ago', notificationType: 'info' },
  { id: 'n-3', type: 'compliance_issue_overdue', title: 'Audit finding requires response', message: 'Supply Chain ESG Audit', detail: 'Supply Chain ESG Audit', is_read: false, time: '6h ago', notificationType: 'urgent' },
  { id: 'n-4', type: 'badge_unlocked', title: 'Quarterly ESG score updated', message: 'Score increased by 3.2 points', detail: 'Score increased by 3.2 points', is_read: true, time: '1d ago', notificationType: 'success' },
];

export const mockLeaderboard: LeaderboardEntry[] = mockSocialReport.leaderboard;

export const mockCSRActivities: CSRActivity[] = [
  { id: 'csr-1', title: 'Community Tree Planting', category: 'cat-1', department: 'dep-1', date: '2026-06-15', description: '8,900 trees planted' },
  { id: 'csr-2', title: 'Beach Cleanup Drive', category: 'cat-1', department: 'dep-2', date: '2026-06-22', description: '12 tonnes removed' },
  { id: 'csr-3', title: 'STEM Mentorship Program', category: 'cat-2', department: 'dep-3', date: '2026-05-10', description: '540 students mentored' },
  { id: 'csr-4', title: 'Food Bank Volunteering', category: 'cat-1', department: 'dep-4', date: '2026-04-18', description: '28k meals served' },
];

export const mockChallenges: Challenge[] = mockSocialReport.challenges;

export const mockBadges: Badge[] = mockSocialReport.badges;

export const mockPolicies: ESGPolicy[] = mockGovernanceReport.policies;

export const mockAudits: Audit[] = mockGovernanceReport.audits;

export const mockIssues: ComplianceIssue[] = mockGovernanceReport.issues;

/** Wraps mock data in the standard API response shape with a simulated delay */
export const mockResolve = async <T>(data: T, ms = 400): Promise<T> => {
  await delay(ms);
  return data;
};
