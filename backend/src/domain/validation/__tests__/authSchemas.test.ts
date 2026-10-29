import { loginSchema, registerSchema } from '../authSchemas';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid email format');
      }
    });

    it('should reject short password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 6 characters');
      }
    });

    it('should reject missing email', () => {
      const result = loginSchema.safeParse({
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should accept strong password with all requirements', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'StrongPass123',
        name: 'Test User',
        group: '10A',
      });
      expect(result.success).toBe(true);
    });

    it('should reject password without uppercase', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'weakpass123',
        name: 'Test User',
        group: '10A',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('uppercase'))).toBe(true);
      }
    });

    it('should reject password without lowercase', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'WEAKPASS123',
        name: 'Test User',
        group: '10A',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('lowercase'))).toBe(true);
      }
    });

    it('should reject password without number', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'WeakPassword',
        name: 'Test User',
        group: '10A',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('number'))).toBe(true);
      }
    });

    it('should reject password shorter than 8 characters', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'Pass1',
        name: 'Test User',
        group: '10A',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(e => e.message.includes('8 characters'))).toBe(true);
      }
    });

    it('should reject missing name', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'StrongPass123',
        group: '10A',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing group', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'StrongPass123',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional role field', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'StrongPass123',
        name: 'Test User',
        group: '10A',
        role: 'student',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'StrongPass123',
        name: 'Test User',
        group: '10A',
        role: 'invalid_role',
      });
      expect(result.success).toBe(false);
    });
  });
});
