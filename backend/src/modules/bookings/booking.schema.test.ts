import { describe, it, expect } from 'vitest';
import { createBookingSchema, updateBookingStatusSchema, updateBookingNotesSchema } from './booking.schema.js';

describe('Booking Validation Schemas', () => {
  describe('createBookingSchema', () => {
    it('should validate valid payload', () => {
      const payload = {
        patientId: '60d21b4667d0d8992e610c85',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 45,
        reason: 'Follow up consultation for lipid panel.',
      };

      const result = createBookingSchema.safeParse({ body: payload });
      expect(result.success).toBe(true);
    });

    it('should reject duration over 120 minutes', () => {
      const payload = {
        patientId: '60d21b4667d0d8992e610c85',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 150, // invalid
        reason: 'Follow up',
      };

      const result = createBookingSchema.safeParse({ body: payload });
      expect(result.success).toBe(false);
    });
  });

  describe('updateBookingStatusSchema', () => {
    it('should validate status change to CONFIRMED with link', () => {
      const result = updateBookingStatusSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: { status: 'CONFIRMED', meetingLink: 'https://zoom.us/j/123456789' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const result = updateBookingStatusSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: { status: 'CONFIRMED', meetingLink: 'not-a-link' },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateBookingNotesSchema', () => {
    it('should validate internal notes', () => {
      const result = updateBookingNotesSchema.safeParse({
        params: { id: '60d21b4667d0d8992e610c85' },
        body: { internalNotes: 'Patient missed previous call, follow up tightly.' },
      });
      expect(result.success).toBe(true);
    });
  });
});
