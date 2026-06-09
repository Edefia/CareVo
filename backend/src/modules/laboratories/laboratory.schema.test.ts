import { describe, it, expect } from 'vitest';
import { createLaboratorySchema, updateLaboratorySchema } from './laboratory.schema.js';

describe('Laboratory Validation Schemas', () => {
  describe('createLaboratorySchema', () => {
    it('should validate a correct payload', () => {
      const payload = {
        name: 'Central Diagnostic Lab',
        code: 'CDL-01',
        contactEmail: 'contact@cdl.com',
        contactPhone: '+1-555-0199',
        address: {
          street: '123 Main St',
          city: 'Metropolis',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
      };

      const result = createLaboratorySchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should reject payload with missing required fields', () => {
      const payload = {
        name: 'Central Diagnostic Lab',
      };

      const result = createLaboratorySchema.safeParse({ body: payload });
      expect(result.success).toBe(false);
    });
  });
});
