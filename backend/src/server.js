import express, { json, urlencoded } from 'express';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Load environment variables
config();

// Import routes
import authRoutes from './routes/auth.routes.js';
import departmentRoutes from './routes/department.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import categoryRoutes from './routes/category.routes.js';
import emissionFactorRoutes from './routes/emissionFactor.routes.js';
import carbonTransactionRoutes from './routes/carbonTransaction.routes.js';
import csrActivityRoutes from './routes/csrActivity.routes.js';
import employeeParticipationRoutes from './routes/employeeParticipation.routes.js';
import challengeRoutes from './routes/challenge.routes.js';
import challengeParticipationRoutes from './routes/challengeParticipation.routes.js';
import badgeRoutes from './routes/badge.routes.js';
import rewardRoutes from './routes/reward.routes.js';
import policyRoutes from './routes/policy.routes.js';
import auditRoutes from './routes/audit.routes.js';
import complianceIssueRoutes from './routes/complianceIssue.routes.js';
import departmentScoreRoutes from './routes/departmentScore.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import reportRoutes from './routes/report.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { authenticateToken } from './middleware/auth.middleware.js';

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', authenticateToken, departmentRoutes);
app.use('/api/employees', authenticateToken, employeeRoutes);
app.use('/api/categories', authenticateToken, categoryRoutes);
app.use('/api/emission-factors', authenticateToken, emissionFactorRoutes);
app.use('/api/carbon-transactions', authenticateToken, carbonTransactionRoutes);
app.use('/api/csr-activities', authenticateToken, csrActivityRoutes);
app.use('/api/employee-participation', authenticateToken, employeeParticipationRoutes);
app.use('/api/challenges', authenticateToken, challengeRoutes);
app.use('/api/challenge-participation', authenticateToken, challengeParticipationRoutes);
app.use('/api/badges', authenticateToken, badgeRoutes);
app.use('/api/rewards', authenticateToken, rewardRoutes);
app.use('/api/policies', authenticateToken, policyRoutes);
app.use('/api/audits', authenticateToken, auditRoutes);
app.use('/api/compliance-issues', authenticateToken, complianceIssueRoutes);
app.use('/api/department-scores', authenticateToken, departmentScoreRoutes);
app.use('/api/leaderboard', authenticateToken, leaderboardRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/settings', authenticateToken, settingsRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'EcoSphere API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecosphere';

connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

export default app;