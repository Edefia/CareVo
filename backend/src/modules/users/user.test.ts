import { describe, it, expect } from 'vitest';
import { updateProfileSchema, changePasswordSchema } from './user.schema.js';

describe('User Validation Schemas', () => {
  describe('updateProfileSchema', () => {
    it('should validate a correct payload', () => {
      const payload = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567890',
      };

      const result = updateProfileSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const payload = {
        firstName: 'Jane',
      };

      const result = updateProfileSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject extra fields', () => {
      const payload = {
        firstName: 'Jane',
        role: 'ADMIN',
      };

      const result = updateProfileSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate a correct password payload', () => {
      const payload = {
        currentPassword: 'OldPassword123!@$',
        newPassword: 'NewPassword123!@$',
      };

      const result = changePasswordSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('should reject a weak new password', () => {
      const payload = {
        currentPassword: 'OldPassword123!@$',
        newPassword: 'weak',
      };

      const result = changePasswordSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('Password must be at least 12 characters');
      }
    });
  });
});
