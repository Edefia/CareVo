import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from './auth.schema.js';

describe('Auth Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate a correct payload', () => {
      const payload = {
        email: 'test@example.com',
        password: 'Password123!@$',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject a weak password', () => {
      const payload = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = registerSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Password must be at least 12 characters');
      }
    });
  });

  describe('loginSchema', () => {
    it('should validate a correct payload', () => {
      const payload = {
        email: 'test@example.com',
        password: 'Password123!@$',
      };

      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const payload = {
        email: 'not-an-email',
        password: 'Password123!@$',
      };

      const result = loginSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });
});
