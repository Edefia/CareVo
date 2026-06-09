import { describe, it, expect } from 'vitest';
import { updatePreferencesSchema, createSubscriptionSchema } from './notification.schema.js';

describe('Notification Validation Schemas', () => {
  describe('updatePreferencesSchema', () => {
    it('should validate valid payload', () => {
      const payload = {
        emailEnabled: false,
        smsEnabled: true,
      };

      const result = updatePreferencesSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should allow partial payload', () => {
      const payload = {
        emailEnabled: false,
      };

      const result = updatePreferencesSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });
  });

  describe('createSubscriptionSchema', () => {
    it('should validate valid payload', () => {
      const payload = {
        patientId: '60d21b4667d0d8992e610c85',
        eventTypes: ['RESULT_FINALIZED'],
      };

      const result = createSubscriptionSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should reject empty eventTypes', () => {
      const payload = {
        patientId: '60d21b4667d0d8992e610c85',
        eventTypes: [],
      };

      const result = createSubscriptionSchema.safeParse({ body: payload });
      expect(result.success).toBe(false);
    });
  });
});
