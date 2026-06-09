import { describe, it, expect } from 'vitest';
import { createTaskSchema, updateTaskStatusSchema, addNoteSchema } from './advocacy.schema.js';

describe('Advocacy Validation Schemas', () => {
  describe('createTaskSchema', () => {
    it('should validate valid payload', () => {
      const payload = {
        patientId: '60d21b4667d0d8992e610c85',
        title: 'Follow up on lipid panel',
        priority: 'HIGH',
      };

      const result = createTaskSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should reject invalid patientId', () => {
      const payload = {
        patientId: 'invalid',
        title: 'Follow up',
      };

      const result = createTaskSchema.safeParse({ body: payload });
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskStatusSchema', () => {
    it('should validate valid status update', () => {
      const result = updateTaskStatusSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: { status: 'COMPLETED' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updateTaskStatusSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: { status: 'DONE' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('addNoteSchema', () => {
    it('should validate valid note', () => {
      const result = addNoteSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: { text: 'Called the patient, they will schedule an appointment.' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty note text', () => {
      const result = addNoteSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: { text: '' },
      });
      expect(result.success).toBe(false);
    });
  });
});
