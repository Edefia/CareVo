import { describe, it, expect } from 'vitest';
import { createPatientProfileSchema } from './patient.schema.js';

describe('Patient Validation Schemas', () => {
  describe('createPatientProfileSchema', () => {
    it('should validate a correct payload', () => {
      const payload = {
        dateOfBirth: new Date('1990-01-01').toISOString(),
        gender: 'Male',
        bloodType: 'O+',
        address: {
          street: '456 Oak St',
          city: 'Smalltown',
          state: 'TX',
          zipCode: '75001',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1-555-0200',
        },
        allergies: ['Penicillin'],
        medicalHistory: ['Hypertension'],
      };

      const result = createPatientProfileSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should allow optional fields to be missing', () => {
      const payload = {}; // all fields optional initially
      const result = createPatientProfileSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should reject invalid gender enum', () => {
      const payload = {
        gender: 'Alien',
      };
      const result = createPatientProfileSchema.safeParse({ body: payload });
      expect(result.success).toBe(false);
    });
  });
});
