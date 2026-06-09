import { describe, it, expect } from 'vitest';
import { createInvoiceSchema, updateInvoiceStatusSchema } from './billing.schema.js';

describe('Billing Validation Schemas', () => {
  describe('createInvoiceSchema', () => {
    it('should validate valid payload', () => {
      const payload = {
        patientId: '60d21b4667d0d8992e610c85',
        amount: 5000, // $50.00
        currency: 'USD',
        description: 'Telemedicine Consultation',
      };

      const result = createInvoiceSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should reject non-integer amount', () => {
      const payload = {
        patientId: '60d21b4667d0d8992e610c85',
        amount: 50.50, // Floats are not allowed, must be cents
        currency: 'USD',
        description: 'Test',
      };

      const result = createInvoiceSchema.safeParse({ body: payload });
      expect(result.success).toBe(false);
    });
  });

  describe('updateInvoiceStatusSchema', () => {
    it('should validate status change to PAID', () => {
      const result = updateInvoiceStatusSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: { status: 'PAID', paymentGateway: 'PAYSTACK' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = updateInvoiceStatusSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: { status: 'DONE' },
      });
      expect(result.success).toBe(false);
    });
  });
});
