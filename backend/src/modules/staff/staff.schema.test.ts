import { describe, it, expect } from 'vitest';
import { inviteStaffSchema } from './staff.schema.js';
import { ROLES } from '../../shared/constants/roles.js';

describe('Staff Validation Schemas', () => {
  describe('inviteStaffSchema', () => {
    it('should validate a correct payload for non-lab roles without laboratoryId', () => {
      const payload = {
        email: 'admin@carebis-prime.com',
        role: ROLES.ADMIN,
      };

      const result = inviteStaffSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should validate a correct payload for lab-scoped roles with laboratoryId', () => {
      const payload = {
        email: 'staff@lab.com',
        role: ROLES.LABORATORY,
        laboratoryId: '60d21b4667d0d8992e610c85',
      };

      const result = inviteStaffSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should reject payload for lab-scoped role without laboratoryId', () => {
      const payload = {
        email: 'staff@lab.com',
        role: ROLES.LABORATORY,
      };

      const result = inviteStaffSchema.safeParse({ body: payload });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('laboratoryId is required for laboratory-scoped roles');
      }
    });

    it('should reject invalid roles', () => {
      const payload = {
        email: 'staff@lab.com',
        role: 'INVALID_ROLE',
      };

      const result = inviteStaffSchema.safeParse({ body: payload });
      expect(result.success).toBe(false);
    });
  });
});
