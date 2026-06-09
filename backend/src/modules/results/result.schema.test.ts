import { describe, it, expect } from 'vitest';
import { createResultSchema, updateResultStatusSchema } from './result.schema.js';

describe('Result Validation Schemas', () => {
  describe('createResultSchema', () => {
    it('should validate a correct payload', () => {
      const payload = {
        patientId: '60d21b4667d0d8992e610c85',
        collectionDate: new Date('2023-10-01').toISOString(),
        panelName: 'Lipid Panel',
        status: 'DRAFT',
        biomarkers: [
          {
            name: 'Total Cholesterol',
            value: 180,
            unit: 'mg/dL',
            referenceRange: '<200',
            flag: 'NORMAL',
          },
        ],
        notes: 'Patient was fasting.',
      };

      const result = createResultSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should reject empty biomarkers array', () => {
      const payload = {
        patientId: '60d21b4667d0d8992e610c85',
        collectionDate: new Date('2023-10-01').toISOString(),
        panelName: 'Lipid Panel',
        biomarkers: [],
      };
      const result = createResultSchema.safeParse({ body: payload });
      expect(result.success).toBe(false);
    });

    it('should default status to DRAFT', () => {
      const payload = {
        patientId: '60d21b4667d0d8992e610c85',
        collectionDate: new Date('2023-10-01').toISOString(),
        panelName: 'Lipid Panel',
        biomarkers: [
          {
            name: 'Total Cholesterol',
            value: 180,
            unit: 'mg/dL',
            referenceRange: '<200',
            flag: 'NORMAL',
          },
        ],
      };
      const result = createResultSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.status).toBe('DRAFT');
      }
    });
  });

  describe('updateResultStatusSchema', () => {
    it('should validate valid status updates', () => {
      const result = updateResultStatusSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: { status: 'FINAL' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updateResultStatusSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: { status: 'INVALID' },
      });
      expect(result.success).toBe(false);
    });
  });
});
