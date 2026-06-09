import { describe, it, expect } from 'vitest';
import { createInterpretationSchema, updateInterpretationSchema, publishInterpretationSchema } from './interpretation.schema.js';

describe('Interpretation Validation Schemas', () => {
  describe('createInterpretationSchema', () => {
    it('should validate valid payload', () => {
      const payload = {
        resultId: '60d21b4667d0d8992e610c85',
        summary: 'Normal Lipid Panel',
        clinicalNotes: 'The patient has shown improvement.',
        recommendations: 'Continue current diet.',
      };

      const result = createInterpretationSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should reject invalid resultId', () => {
      const payload = {
        resultId: 'invalid-id',
        summary: 'Normal Lipid Panel',
      };

      const result = createInterpretationSchema.safeParse({ body: payload });
      expect(result.success).toBe(false);
    });
  });

  describe('updateInterpretationSchema', () => {
    it('should validate partial update payload', () => {
      const payload = {
        summary: 'Updated Summary',
      };

      const result = updateInterpretationSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: payload,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('publishInterpretationSchema', () => {
    it('should validate valid params', () => {
      const result = publishInterpretationSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
      });
      expect(result.success).toBe(true);
    });
  });
});
