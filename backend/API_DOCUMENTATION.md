# EcoSphere API Documentation

## Overview
This document provides a comprehensive guide to the EcoSphere ESG Management Platform API.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

You can obtain a token by:
1. Registering a new user via `POST /auth/signup`
2. Logging in via `POST /auth/login`

## Response Format
All API responses follow a standard format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/signup` | Register new user | Public |
| POST | `/auth/login` | Login and get token | Public |
| GET | `/auth/me` | Get current user profile | Private |
| PUT | `/auth/profile` | Update user profile | Private |
| PUT | `/auth/change-password` | Change password | Private |

### Departments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/departments` | Get all departments | Private |
| GET | `/departments/:id` | Get department by ID | Private |
| POST | `/departments` | Create department | Admin |
| PUT | `/departments/:id` | Update department | Admin |
| DELETE | `/departments/:id` | Delete department | Admin |
| GET | `/departments/:id/score` | Get department ESG score | Private |

### Employees
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/employees` | Get all employees (with filtering) | Private |
| GET | `/employees/:id` | Get employee by ID | Private |
| PUT | `/employees/:id` | Update employee | Admin |
| DELETE | `/employees/:id` | Delete employee | Admin |
| GET | `/employees/:id/badges` | Get employee's badges | Private |
| GET | `/employees/:id/profile` | Get employee profile with stats | Private |

### Categories
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/categories` | Get all categories | Private |
| GET | `/categories/:id` | Get category by ID | Private |
| POST | `/categories` | Create category | Admin |
| PUT | `/categories/:id` | Update category | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |
| PUT | `/categories/:id/activate` | Activate category | Admin |
| PUT | `/categories/:id/deactivate` | Deactivate category | Admin |

### Emission Factors
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/emission-factors` | Get all emission factors | Private |
| GET | `/emission-factors/:id` | Get emission factor by ID | Private |
| POST | `/emission-factors` | Create emission factor | Admin |
| PUT | `/emission-factors/:id` | Update emission factor | Admin |
| DELETE | `/emission-factors/:id` | Delete emission factor | Admin |

### Carbon Transactions
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/carbon-transactions` | Get all carbon transactions | Private |
| GET | `/carbon-transactions/:id` | Get carbon transaction by ID | Private |
| POST | `/carbon-transactions` | Create manual carbon transaction | Private |
| POST | `/carbon-transactions/calculate-from-source` | Calculate emissions from source record | Private |
| PUT | `/carbon-transactions/:id` | Update carbon transaction | Private |
| DELETE | `/carbon-transactions/:id` | Delete carbon transaction | Private |
| POST | `/carbon-transactions/process-all` | Process all unprocessed source records | Admin |

### CSR Activities
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/csr-activities` | Get all CSR activities | Private |
| GET | `/csr-activities/:id` | Get CSR activity by ID | Private |
| POST | `/csr-activities` | Create CSR activity | Admin |
| PUT | `/csr-activities/:id` | Update CSR activity | Admin |
| DELETE | `/csr-activities/:id` | Delete CSR activity | Admin |

### Employee Participation
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/employee-participation` | Get all participations | Private |
| GET | `/employee-participation/employee/:employeeId` | Get participations by employee | Private |
| GET | `/employee-participation/activity/:activityId` | Get participations by activity | Private |
| GET | `/employee-participation/:employeeId/:activityId` | Get participation by employee and activity | Private |
| POST | `/employee-participation` | Create new participation | Private |
| PATCH | `/employee-participation/:id` | Update participation approval status | Private |

### Challenges
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/challenges` | Get all challenges | Private |
| GET | `/challenges/:id` | Get challenge by ID | Private |
| POST | `/challenges` | Create challenge | Admin |
| PUT | `/challenges/:id` | Update challenge | Admin |
| PATCH | `/challenges/:id/status` | Change challenge status | Admin |
| DELETE | `/challenges/:id` | Delete challenge | Admin |

### Challenge Participation
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/challenge-participation` | Get all participations | Private |
| GET | `/challenge-participation/challenge/:challengeId` | Get participations by challenge | Private |
| GET | `/challenge-participation/employee/:employeeId` | Get participations by employee | Private |
| GET | `/challenge-participation/:challengeId/:employeeId` | Get participation by challenge and employee | Private |
| POST | `/challenge-participation` | Create new challenge participation | Private |
| PATCH | `/challenge-participation/:id/progress` | Update participation progress | Private |
| PATCH | `/challenge-participation/:id/proof` | Update participation proof file | Private |
| PATCH | `/challenge-participation/:id` | Update participation approval status | Private |

### Badges
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/badges` | Get all badges | Private |
| GET | `/badges/:id` | Get badge by ID | Private |
| POST | `/badges` | Create badge | Admin |
| PUT | `/badges/:id` | Update badge | Admin |
| DELETE | `/badges/:id` | Delete badge | Admin |
| GET | `/employees/:id/badges` | Get user's badges | Private |
| GET | `/employees/:id/badges/:badgeId/check` | Check if user has specific badge | Private |
| POST | `/badges/:id/award` | Award badge to user | Admin |

### Rewards
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/rewards` | Get all rewards | Private |
| GET | `/rewards/:id` | Get reward by ID | Private |
| POST | `/rewards` | Create reward | Admin |
| PUT | `/rewards/:id` | Update reward | Admin |
| DELETE | `/rewards/:id` | Delete reward | Admin |
| POST | `/rewards/:id/redeem` | Redeem reward | Private |
| GET | `/users/:userId/rewards/redemptions` | Get user's redemption history | Private |
| POST | `/rewards/:id/restock` | Restock reward | Admin |
| GET | `/reports/rewards-stats` | Get reward statistics | Admin |

### Policies
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/policies` | Get all policies | Private |
| GET | `/policies/:id` | Get policy by ID | Private |
| POST | `/policies` | Create policy | Admin |
| PUT | `/policies/:id` | Update policy | Admin |
| DELETE | `/policies/:id` | Delete policy | Admin |
| POST | `/policies/:id/acknowledge` | Acknowledge policy | Private |
| GET | `/policies/:id/acknowledgements` | Get acknowledgements for policy | Private |
| GET | `/users/:userId/policies/:policyId/acknowledgement` | Get user's acknowledgement status | Private |
| GET | `/users/:userId/policies/unacknowledged` | Get unacknowledged policies for user | Private |

### Audits
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/audits` | Get all audits | Private |
| GET | `/audits/:id` | Get audit by ID | Private |
| POST | `/audits` | Create audit | Admin |
| PUT | `/audits/:id` | Update audit | Admin |
| DELETE | `/audits/:id` | Delete audit | Admin |
| PATCH | `/audits/:id/start` | Start audit | Admin |
| PATCH | `/audits/:id/complete` | Complete audit | Admin |
| PATCH | `/audits/:id/cancel` | Cancel audit | Admin |

### Compliance Issues
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/compliance-issues` | Get all compliance issues | Private |
| GET | `/compliance-issues/:id` | Get compliance issue by ID | Private |
| POST | `/compliance-issues` | Create compliance issue | Admin |
| PUT | `/compliance-issues/:id` | Update compliance issue | Admin |
| DELETE | `/compliance-issues/:id` | Delete compliance issue | Admin |
| GET | `/compliance-issues/overdue` | Get overdue compliance issues | Private |
| POST | `/compliance-issues/check-overdue` | Check and notify overdue issues | Admin |
| GET | `/compliance-issues/stats` | Get compliance statistics | Admin |

### Department Scores
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/department-scores` | Get all department scores | Private |
| GET | `/department-scores/:id` | Get department score by ID | Private |
| GET | `/departments/:departmentId/score` | Get score for specific department | Private |
| POST | `/department-scores/:id/calculate` | Calculate and update department score | Admin |
| POST | `/department-scores/calculate-all` | Calculate and update all department scores | Admin |
| GET | `/org/esg-score` | Get organizational ESG score | Private |
| POST | `/org/esg-score/calculate` | Calculate organizational ESG score | Admin |

### Leaderboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/leaderboard/xp` | Get leaderboard by XP | Private |
| GET | `/leaderboard/points` | Get leaderboard by points | Private |
| GET | `/leaderboard/badges` | Get leaderboard by badge count | Private |

### Reports
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/reports/environmental` | Get environmental report | Private |
| GET | `/reports/social` | Get social report | Private |
| GET | `/reports/governance` | Get governance report | Private |
| GET | `/reports/esg-summary` | Get ESG summary report | Private |
| POST | `/reports/custom` | Get custom report with filtering | Private |

### Settings
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/settings` | Get application settings | Private |
| PUT | `/settings` | Update settings | Admin |
| DELETE | `/settings` | Reset settings to default | Admin |

### Notifications
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/notifications` | Get notifications for current user | Private |
| GET | `/notifications/unread-count` | Get unread notification count | Private |
| PATCH | `/notifications/:id/read` | Mark notification as read | Private |
| PATCH | `/notifications/read-all` | Mark all notifications as read | Private |
| DELETE | `/notifications/:id` | Delete notification | Private |
| GET | `/notifications/all` | Get all notifications | Admin |

## Data Models

### User
- `name`: String (required)
- `email`: String (required, unique)
- `password_hash`: String (required)
- `department`: ObjectId (ref: Department, required)
- `role`: String (enum: admin, manager, employee, default: employee)
- `status`: String (enum: active, inactive, suspended, default: active)
- `xp_total`: Number (default: 0)
- `points_balance`: Number (default: 0)

### Department
- `name`: String (required)
- `code`: String (required, unique)
- `head`: ObjectId (ref: User)
- `parent_department`: ObjectId (ref: Department, self-reference)
- `employee_count`: Number (default: 0)
- `status`: String (enum: active, inactive, default: active)

### Category
- `name`: String (required)
- `type`: String (enum: CSR_ACTIVITY, CHALLENGE, required)
- `status`: String (enum: active, inactive, default: active)

### EmissionFactor
- `name`: String (required)
- `category`: String (required)
- `unit`: String (required)
- `co2_factor_value`: Number (required, min: 0)

### CarbonTransaction
- `department`: ObjectId (ref: Department, required)
- `source_type`: String (enum: PURCHASE, MANUFACTURING, EXPENSE, FLEET, required)
- `source_record_id`: ObjectId (required, refPath: source_type)
- `emission_factor`: ObjectId (ref: EmissionFactor, required)
- `calculated_co2`: Number (required, min: 0)
- `date`: Date (required, default: Date.now)
- `is_auto_calculated`: Boolean (default: false)

### CSRActivity
- `title`: String (required)
- `category`: ObjectId (ref: Category, required)
- `department`: ObjectId (ref: Department, required)
- `date`: Date (required, default: Date.now)
- `description`: String

### EmployeeParticipation
- `employee`: ObjectId (ref: User, required)
- `activity`: ObjectId (ref: CSRActivity, required)
- `proof_file_url`: String
- `approval_status`: String (enum: PENDING, APPROVED, REJECTED, default: PENDING)
- `points_earned`: Number (default: 0)
- `completion_date`: Date

### Challenge
- `title`: String (required)
- `category`: ObjectId (ref: Category, required)
- `description`: String
- `xp_value`: Number (required, min: 0)
- `difficulty`: String (enum: EASY, MEDIUM, HARD, required)
- `evidence_required`: Boolean (default: false)
- `deadline`: Date
- `status`: String (enum: DRAFT, ACTIVE, UNDER_REVIEW, COMPLETED, ARCHIVED, default: DRAFT)

### ChallengeParticipation
- `challenge`: ObjectId (ref: Challenge, required)
- `employee`: ObjectId (ref: User, required)
- `progress`: Number (min: 0, max: 100, default: 0)
- `proof_file_url`: String
- `approval_status`: String (enum: PENDING, APPROVED, REJECTED, default: PENDING)
- `xp_awarded`: Number (default: 0)

### Badge
- `name`: String (required)
- `description`: String (required)
- `unlock_rule`: Object (required, structure: {type: string, value: number})
- `icon_url`: String

### EmployeeBadge
- `employee`: ObjectId (ref: User, required)
- `badge`: ObjectId (ref: Badge, required)
- `earned_at`: Date (default: Date.now)

### Reward
- `name`: String (required)
- `description`: String (required)
- `points_required`: Number (required, min: 0)
- `stock`: Number (required, min: 0)
- `status`: String (enum: active, inactive, out_of_stock, default: active)

### RewardRedemption
- `user`: ObjectId (ref: User, required)
- `reward`: ObjectId (ref: Reward, required)
- `points_spent`: Number (required)
- `redeemed_at`: Date (default: Date.now)

### ESGPolicy
- `title`: String (required)
- `description`: String (required)
- `version`: String (required)
- `effective_date`: Date (required)

### PolicyAcknowledgement
- `employee`: ObjectId (ref: User, required)
- `policy`: ObjectId (ref: ESGPolicy, required)
- `acknowledged_date`: Date (nullable = not acknowledged)

### Audit
- `department`: ObjectId (ref: Department, required)
- `scope`: String (required)
- `date`: Date (required)
- `auditor`: ObjectId (ref: User, required)
- `status`: String (enum: scheduled, in_progress, completed, cancelled, default: scheduled)

### ComplianceIssue
- `audit`: ObjectId (ref: Audit, required)
- `severity`: String (enum: LOW, MEDIUM, HIGH, CRITICAL, required)
- `description`: String (required)
- `owner`: ObjectId (ref: User, required)
- `due_date`: Date (required)
- `status`: String (enum: OPEN, IN_PROGRESS, RESOLVED, default: OPEN)

### DepartmentScore
- `department`: ObjectId (ref: Department, required, unique)
- `environmental_score`: Number (default: 0, min: 0, max: 100)
- `social_score`: Number (default: 0, min: 0, max: 100)
- `governance_score`: Number (default: 0, min: 0, max: 100)
- `total_score`: Number (default: 0, min: 0, max: 100)
- `calculated_at`: Date (default: Date.now)

### Notification
- `recipient`: ObjectId (ref: User, required)
- `type`: String (enum: new_compliance_issue, csr_participation_approved, csr_participation_rejected, challenge_participation_approved, challenge_participation_rejected, policy_acknowledgement_reminder, badge_unlocked, compliance_issue_overdue, required)
- `message`: String (required)
- `is_read`: Boolean (default: false)

### Settings
- `auto_emission_calculation_enabled`: Boolean (default: true)
- `evidence_requirement_enabled`: Boolean (default: true)
- `badge_auto_award_enabled`: Boolean (default: true)
- `notification_settings`: Object (default: all notification types enabled)
- `esg_weights`: Object (default: {environmental_weight: 0.4, social_weight: 0.3, governance_weight: 0.3})

## Error Codes
- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting
API requests are limited to 100 requests per minute per IP address.

## Versioning
Current API version: v1

## Support
For API-related questions, please contact the development team.