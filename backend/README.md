# EcoSphere Backend - ESG Management Platform

This is the backend API for the EcoSphere ESG (Environmental, Social, Governance) Management Platform. Built with Node.js, Express, and MongoDB.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Authentication](#authentication)
- [Business Logic](#business-logic)
- [Seeding Data](#seeding-data)
- [Testing](#testing)

## Features

- Complete ESG management system with environmental, social, and governance tracking
- Role-based access control (Admin, Manager, Employee)
- Carbon emission tracking with automatic calculation from source data
- CSR activity and challenge management
- Employee participation tracking with points and XP system
- Badge and reward system
- Policy management and acknowledgment tracking
- Audit and compliance issue tracking
- Department and organizational ESG scoring
- Comprehensive reporting with CSV export
- Notification system
- Settings management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: Bcrypt
- **Validation**: Joi
- **API Documentation**: Self-describing routes
- **Seeding**: Custom seed script for test data

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up MongoDB (local or cloud)
4. Configure environment variables (see below)
5. Seed the database:
   ```bash
   npm run seed
   ```
6. Start the server:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecosphere
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

All API endpoints are prefixed with `/api`

### Authentication
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user profile
- `PUT /auth/profile` - Update user profile
- `PUT /auth/change-password` - Change user password

### Departments
- `GET /departments` - Get all departments
- `GET /departments/:id` - Get department by ID
- `POST /departments` - Create department (Admin only)
- `PUT /departments/:id` - Update department (Admin only)
- `DELETE /departments/:id` - Delete department (Admin only)
- `GET /departments/:id/score` - Get department ESG score

### Employees/Users
- `GET /employees` - Get all users (with filtering)
- `GET /employees/:id` - Get user by ID
- `PUT /employees/:id` - Update user (Admin only)
- `DELETE /employees/:id` - Delete user (Admin only)
- `GET /employees/:id/badges` - Get user's badges
- `GET /employees/:id/profile` - Get user profile with stats

### Categories
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create category (Admin only)
- `PUT /categories/:id` - Update category (Admin only)
- `DELETE /categories/:id` - Delete category (Admin only)
- `PUT /categories/:id/activate` - Activate category (Admin only)
- `PUT /categories/:id/deactivate` - Deactivate category (Admin only)

### Emission Factors
- `GET /emission-factors` - Get all emission factors
- `GET /emission-factors/:id` - Get emission factor by ID
- `POST /emission-factors` - Create emission factor (Admin only)
- `PUT /emission-factors/:id` - Update emission factor (Admin only)
- `DELETE /emission-factors/:id` - Delete emission factor (Admin only)

### Carbon Transactions
- `GET /carbon-transactions` - Get all carbon transactions (with filtering)
- `GET /carbon-transactions/:id` - Get carbon transaction by ID
- `POST /carbon-transactions` - Create manual carbon transaction
- `POST /carbon-transactions/calculate-from-source` - Calculate emissions from source record
- `PUT /carbon-transactions/:id` - Update carbon transaction
- `DELETE /carbon-transactions/:id` - Delete carbon transaction
- `POST /carbon-transactions/process-all` - Process all unprocessed source records (Admin only)

### CSR Activities
- `GET /csr-activities` - Get all CSR activities
- `GET /csr-activities/:id` - Get CSR activity by ID
- `POST /csr-activities` - Create CSR activity (Admin only)
- `PUT /csr-activities/:id` - Update CSR activity (Admin only)
- `DELETE /csr-activities/:id` - Delete CSR activity (Admin only)

### Employee Participation
- `GET /employee-participation` - Get all participations
- `GET /employee-participation/employee/:employeeId` - Get participations by employee
- `GET /employee-participation/activity/:activityId` - Get participations by activity
- `GET /employee-participation/:employeeId/:activityId` - Get participation by employee and activity
- `POST /employee-participation` - Create new participation
- `PATCH /employee-participation/:id` - Update participation approval status

### Challenges
- `GET /challenges` - Get all challenges
- `GET /challenges/:id` - Get challenge by ID
- `POST /challenges` - Create challenge (Admin only)
- `PUT /challenges/:id` - Update challenge (Admin only)
- `PATCH /challenges/:id/status` - Change challenge status (Admin only)
- `DELETE /challenges/:id` - Delete challenge (Admin only)

### Challenge Participation
- `GET /challenge-participation` - Get all challenge participations
- `GET /challenge-participation/challenge/:challengeId` - Get participations by challenge
- `GET /challenge-participation/employee/:employeeId` - Get participations by employee
- `GET /challenge-participation/:challengeId/:employeeId` - Get participation by challenge and employee
- `POST /challenge-participation` - Create new challenge participation
- `PATCH /challenge-participation/:id/progress` - Update participation progress
- `PATCH /challenge-participation/:id/proof` - Update participation proof file
- `PATCH /challenge-participation/:id` - Update participation approval status

### Badges
- `GET /badges` - Get all badges
- `GET /badges/:id` - Get badge by ID
- `POST /badges` - Create badge (Admin only)
- `PUT /badges/:id` - Update badge (Admin only)
- `DELETE /badges/:id` - Delete badge (Admin only)
- `GET /employees/:id/badges` - Get user's badges
- `GET /employees/:id/badges/:badgeId/check` - Check if user has specific badge
- `POST /badges/:id/award` - Award badge to user (Admin only)

### Rewards
- `GET /rewards` - Get all rewards
- `GET /rewards/:id` - Get reward by ID
- `POST /rewards` - Create reward (Admin only)
- `PUT /rewards/:id` - Update reward (Admin only)
- `DELETE /rewards/:id` - Delete reward (Admin only)
- `POST /rewards/:id/redeem` - Redeem reward
- `GET /users/:userId/rewards/redemptions` - Get user's redemption history
- `POST /rewards/:id/restock` - Restock reward (Admin only)
- `GET /reports/rewards-stats` - Get reward statistics (Admin only)

### Policies
- `GET /policies` - Get all policies
- `GET /policies/:id` - Get policy by ID
- `POST /policies` - Create policy (Admin only)
- `PUT /policies/:id` - Update policy (Admin only)
- `DELETE /policies/:id` - Delete policy (Admin only)
- `POST /policies/:id/acknowledge` - Acknowledge policy
- `GET /policies/:id/acknowledgements` - Get acknowledgements for policy
- `GET /users/:userId/policies/:policyId/acknowledgement` - Get user's acknowledgement status
- `GET /users/:userId/policies/unacknowledged` - Get unacknowledged policies for user

### Audits
- `GET /audits` - Get all audits
- `GET /audits/:id` - Get audit by ID
- `POST /audits` - Create audit (Admin only)
- `PUT /audits/:id` - Update audit (Admin only)
- `DELETE /audits/:id` - Delete audit (Admin only)
- `PATCH /audits/:id/start` - Start audit (Admin only)
- `PATCH /audits/:id/complete` - Complete audit (Admin only)
- `PATCH /audits/:id/cancel` - Cancel audit (Admin only)

### Compliance Issues
- `GET /compliance-issues` - Get all compliance issues
- `GET /compliance-issues/:id` - Get compliance issue by ID
- `POST /compliance-issues` - Create compliance issue (Admin only)
- `PUT /compliance-issues/:id` - Update compliance issue (Admin only)
- `DELETE /compliance-issues/:id` - Delete compliance issue (Admin only)
- `GET /compliance-issues/overdue` - Get overdue compliance issues
- `POST /compliance-issues/check-overdue` - Check and notify overdue issues (Admin only)
- `GET /compliance-issues/stats` - Get compliance statistics

### Department Scores
- `GET /department-scores` - Get all department scores
- `GET /department-scores/:id` - Get department score by ID
- `GET /departments/:departmentId/score` - Get score for specific department
- `POST /department-scores/:id/calculate` - Calculate and update department score (Admin only)
- `POST /department-scores/calculate-all` - Calculate and update all department scores (Admin only)
- `GET /org/esg-score` - Get organizational ESG score
- `POST /org/esg-score/calculate` - Calculate organizational ESG score (Admin only)

### Leaderboard
- `GET /leaderboard/xp` - Get leaderboard by XP
- `GET /leaderboard/points` - Get leaderboard by points
- `GET /leaderboard/badges` - Get leaderboard by badge count

### Reports
- `GET /reports/environmental` - Get environmental report
- `GET /reports/social` - Get social report
- `GET /reports/governance` - Get governance report
- `GET /reports/esg-summary` - Get ESG summary report
- `POST /reports/custom` - Get custom report with filtering

### Settings
- `GET /settings` - Get application settings
- `PUT /settings` - Update settings (Admin only)
- `DELETE /settings` - Reset settings to default (Admin only)

### Notifications
- `GET /notifications` - Get notifications for current user
- `GET /notifications/unread-count` - Get unread notification count
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/read-all` - Mark all notifications as read
- `DELETE /notifications/:id` - Delete notification
- `GET /notifications/all` - Get all notifications (Admin only)

## Data Models

### Core Entities
- **User/Employee**: Personnel with roles, departments, XP, and points
- **Department**: Organizational units with hierarchical structure
- **Category**: Classification for CSR activities and challenges
- **EmissionFactor**: CO2 conversion factors for various activities
- **ProductESGProfile**: ESG attributes of products
- **EnvironmentalGoal**: Sustainability targets for departments or organization
- **ESGPolicy**: Company policies requiring employee acknowledgment
- **Badge**: Achievements that can be earned by employees
- **Reward**: Items that can be redeemed with points

### Transactional Entities
- **CarbonTransaction**: Record of CO2 emissions from various sources
- **CSRActivity**: Corporate Social Responsibility activities
- **EmployeeParticipation**: Employee involvement in CSR activities
- **Challenge**: Sustainability challenges for employees
- **ChallengeParticipation**: Employee participation in challenges
- **PolicyAcknowledgement**: Tracking of policy acceptance by employees
- **Audit**: Formal examinations of processes and compliance
- **ComplianceIssue**: Issues found during audits requiring remediation
- **DepartmentScore**: ESG scores calculated for each department
- **UserBadge**: Mapping of users to earned badges
- **RewardRedemption**: Tracking of redeemed rewards
- **Notification**: System notifications for users

### Source Data (for auto calculation)
- **FleetLog**: Vehicle fuel consumption data
- **PurchaseRecord**: Purchased goods and quantities
- **ManufacturingRecord**: Manufacturing process outputs
- **ExpenseRecord**: Financial expenses with emission factors

### Configuration
- **Settings**: System configuration including feature flags and ESG weights

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Login via `POST /auth/login` with email and password
2. Include the returned token in the Authorization header:
   ```
   Authorization: Bearer <your_token_here>
   ```

## Business Logic Implementation

The backend implements all 6 mandatory business rules:

1. **Reward Redemption**: POST `/rewards/:id/redeem` checks stock and points, then atomically updates both
2. **Notification System**: Triggered on compliance issues, participation approvals/rejections, policy reminders, and badge unlocks
3. **Auto Emission Calculation**: When enabled, processes FleetLog/PurchaseRecord/ManufacturingRecord/ExpenseRecord to create CarbonTransaction records
4. **Evidence Requirement**: When enabled, blocks approval of participation without proof file URL
5. **Badge Auto-Award**: When enabled, checks badge criteria after XP/challenges/points changes and awards qualifying badges
6. **Compliance Issue Ownership**: Requires owner and due date on creation; provides overdue checking and notification

## Seeding Data

The seed script creates:
- 6 departments with hierarchy (HQ with R&D, Marketing, Sales, Manufacturing, Logistics reporting to it)
- 10 users with various roles (1 admin, 2 managers, 7 employees)
- 6 categories (3 CSR, 3 challenges)
- 10 emission factors for various sources
- Source records for auto emission calculation (5 each of FleetLog, PurchaseRecord, ManufacturingRecord, ExpenseRecord)
- 4 CSR activities with mixed approval states
- 4 challenges in different lifecycle states with participation records
- 4 badges with various unlock rules (some achievable by seeded users)
- 5 rewards with varying stock levels
- 3 policies with partial acknowledgements
- 3 audits with compliance issues (including 1 overdue/open issue)
- Default settings with all toggles ON

Run the seeder with:
```bash
npm run seed
```

## Testing

To run tests:
```bash
npm test
```

## Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware (auth, error handling)
├── models/          # Mongoose schemas and models
├── routes/          # API route definitions
├── utils/           # Service classes and helper functions
├── seed/            # Database seeding scripts
├── .env             # Environment variables
├── .gitignore       # Git ignore rules
├── package.json     # Dependencies and scripts
├── README.md        # This file
└── server.js        # Application entry point
```

## API Response Format

All API responses follow this format:

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

For validation errors, additional field-specific errors may be included.

## Pagination

List endpoints that support pagination use these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: varies by endpoint)

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 2,
    "limit": 10,
    "pages": 10
  }
}
```

## Filtering

Many GET endpoints support filtering via query parameters. Refer to individual endpoint documentation for available filters.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.