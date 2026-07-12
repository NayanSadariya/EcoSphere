import request from 'supertest';
import { connect, disconnect } from 'mongoose';
import app from '../src/server';
import User from '../src/models/User.js';
import Department from '../src/models/Department.js';
import { genSalt, hash } from 'bcryptjs';
import { config } from 'dotenv';

config();

describe('EcoSphere API', () => {
  let token;
  let testUserId;
  let testDeptId;

  beforeAll(async () => {
    // Connect to test database
    const testUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecosphere_test';
    await connect(testUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Department.deleteMany({});

    // Create a test department for use in tests
    const dept = await Department.create({
      name: 'Test Department',
      code: 'TEST',
      employee_count: 0
    });
    testDeptId = dept._id;
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          department: testDeptId.toString(),
          role: 'employee'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('name', 'Test User');
    });

    it('should login existing user', async () => {
      // Create a user first
      const salt = await genSalt(12);
      const hashedPassword = await hash('password123', salt);

      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: hashedPassword,
        department: testDeptId,
        role: 'employee'
      });
      testUserId = user._id;

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      token = res.body.data.token;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', 'test@example.com');
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .send();

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });
});