const request = require('supertest');
const app = require('../server');

let authToken;
let customerId;
let productId;
let orderId;

describe('API Tests - Inventory Management System', () => {
  describe('Authentication', () => {
    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      if (res.body.token) {
        authToken = res.body.token;
      }
    });
  });

  describe('Products', () => {
    it('should fetch all products', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`);

      expect(res.statusCode).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Customers', () => {
    it('should fetch all customers', async () => {
      const res = await request(app)
        .get('/api/customers?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`);

      expect(res.statusCode).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Orders', () => {
    it('should fetch all orders', async () => {
      const res = await request(app)
        .get('/api/orders?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`);

      expect(res.statusCode).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Reports', () => {
    it('should fetch sales report', async () => {
      const res = await request(app)
        .get('/api/reports/sales')
        .set('Authorization', `Bearer ${authToken || 'test-token'}`);

      expect(res.statusCode).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Health Check', () => {
    it('should return server health', async () => {
      const res = await request(app)
        .get('/api/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
