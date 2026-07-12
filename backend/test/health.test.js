import request from 'supertest';
import { connect, disconnect } from 'mongoose';
import app from '../src/server.js';
import { config } from 'dotenv';

config();

describe('Health Check', () => {
  let server;

  beforeAll((done) => {
    // Connect to test database
    const testUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecosphere_test';
    connect(testUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then(() => {
      // Start server on a different port for testing
      server = app.listen(5001, done);
    });
  });

  afterAll((done) => {
    // Close server and disconnect from database
    server.close(() => {
      disconnect().then(done);
    });
  });

  it('should return health check success', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('EcoSphere API is running');
  });
});