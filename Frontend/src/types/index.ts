/** Shared API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
}

/* ---------- Auth ---------- */
export type UserRole = 'admin' | 'manager' | 'employee';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: UserStatus;
  xp_total: number;
  points_balance: number;
  avatar?: string;
  organization?: string;
  memberSince?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  phone?: string;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  department?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/* ---------- Departments ---------- */
export interface Department {
  id: string;
  name: string;
  code: string;
  head?: string;
  parent_department?: string;
  employee_count: number;
  status: 'active' | 'inactive';
}

export interface DepartmentScore {
  id: string;
  department: string;
  departmentName?: string;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  total_score: number;
  calculated_at: string;
}

export interface OrgEsgScore {
  environmental_score: number;
  social_score: number;
  governance_score: number;
  total_score: number;
  grade: string;
  trend: number;
  rank: string;
}

/* ---------- Categories ---------- */
export interface Category {
  id: string;
  name: string;
  type: 'CSR_ACTIVITY' | 'CHALLENGE';
  status: 'active' | 'inactive';
}

/* ---------- Carbon ---------- */
export interface EmissionFactor {
  id: string;
  name: string;
  category: string;
  unit: string;
  co2_factor_value: number;
}

export interface CarbonTransaction {
  id: string;
  department: string;
  source_type: 'PURCHASE' | 'MANUFACTURING' | 'EXPENSE' | 'FLEET';
  emission_factor: string;
  calculated_co2: number;
  date: string;
  is_auto_calculated: boolean;
}

export interface EnvironmentalReport {
  scope1: number;
  scope2: number;
  scope3: number;
  offset: number;
  net: number;
  monthly: number[];
  renewable: number;
  fossil: number;
  energySources: { label: string; value: number; color: string }[];
  sustainabilityGoals: { title: string; progress: number; status: string; target: string; current: string }[];
  departmentScores: { dept: string; score: number; trend: number }[];
  reports: { title: string; framework: string; date: string; status: string }[];
}

/* ---------- CSR ---------- */
export interface CSRActivity {
  id: string;
  title: string;
  category: string;
  department: string;
  date: string;
  description?: string;
}

export interface EmployeeParticipation {
  id: string;
  employee: string;
  activity: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  points_earned: number;
  completion_date?: string;
}

/* ---------- Challenges ---------- */
export interface Challenge {
  id: string;
  title: string;
  category: string;
  description?: string;
  xp_value: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  evidence_required: boolean;
  deadline: string;
  status: 'DRAFT' | 'ACTIVE' | 'UNDER_REVIEW' | 'COMPLETED' | 'ARCHIVED';
  participants?: number;
  progress?: number;
}

export interface ChallengeParticipation {
  id: string;
  challenge: string;
  employee: string;
  progress: number;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  xp_awarded: number;
}

/* ---------- Badges ---------- */
export interface Badge {
  id: string;
  name: string;
  description: string;
  unlock_rule: { type: string; value: number };
  icon_url?: string;
  icon?: string;
  earned?: boolean;
  rarity?: string;
}

export interface EmployeeBadge {
  id: string;
  employee: string;
  badge: string;
  earned_at: string;
}

/* ---------- Rewards ---------- */
export interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  icon?: string;
  available?: boolean;
}

export interface RewardRedemption {
  id: string;
  user: string;
  reward: string;
  points_spent: number;
  redeemed_at: string;
}

/* ---------- Governance ---------- */
export interface ESGPolicy {
  id: string;
  title: string;
  description: string;
  version: string;
  effective_date: string;
  category?: string;
  reviewed?: string;
  status?: string;
  coverage?: number;
}

export interface PolicyAcknowledgement {
  id: string;
  employee: string;
  policy: string;
  acknowledged_date: string | null;
}

export interface Audit {
  id: string;
  department: string;
  scope: string;
  date: string;
  auditor: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  type?: string;
  findings?: number;
}

export interface ComplianceIssue {
  id: string;
  audit: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  title?: string;
  owner: string;
  assignee?: string;
  due_date: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  age?: number;
}

export interface GovernanceReport {
  complianceScore: number;
  frameworks: { name: string; status: string; lastAudit: string }[];
  trainingCompletion: number;
  policyReviews: number;
  policies: ESGPolicy[];
  audits: Audit[];
  issues: ComplianceIssue[];
}

/* ---------- Social Report ---------- */
export interface SocialReport {
  csrActivities: { title: string; participants: number; hours: number; impact: string; status: string }[];
  participation: {
    rate: number;
    totalEmployees: number;
    activeParticipants: number;
    avgHoursPerEmployee: number;
    trend: number[];
  };
  challenges: Challenge[];
  xp: { total: number; level: number; nextLevel: number; weekly: number; rank: string };
  badges: Badge[];
  leaderboard: { rank: number; name: string; dept: string; xp: number; avatar: string }[];
}

/* ---------- Notifications ---------- */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  detail?: string;
  is_read: boolean;
  time?: string;
  notificationType?: 'warning' | 'info' | 'urgent' | 'success';
}

/* ---------- Settings ---------- */
export interface AppSettings {
  auto_emission_calculation_enabled: boolean;
  evidence_requirement_enabled: boolean;
  badge_auto_award_enabled: boolean;
  notification_settings: Record<string, boolean>;
  esg_weights: {
    environmental_weight: number;
    social_weight: number;
    governance_weight: number;
  };
}

/* ---------- Leaderboard ---------- */
export interface LeaderboardEntry {
  rank: number;
  name: string;
  dept: string;
  xp: number;
  avatar: string;
}
