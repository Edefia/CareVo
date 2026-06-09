import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID'),
    staffId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional().nullable(),
    scheduledAt: z.string().datetime(),
    durationMinutes: z.number().int().min(15).max(120).default(30),
    reason: z.string().min(5).max(500),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
    meetingLink: z.string().url().optional().nullable(),
  }),
});

export const updateBookingNotesSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  }),
  body: z.object({
    internalNotes: z.string().nullable(),
  }),
});
