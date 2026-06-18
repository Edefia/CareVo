import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID'),
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid package ID'),
    locationType: z.enum(['HOME', 'CLINIC']),
    staffId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID').optional().nullable(),
    laboratoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lab ID').optional().nullable(),
    scheduledAt: z.string().datetime(),
    durationMinutes: z.number().int().min(15).max(120).default(30),
    reason: z.string().max(500).optional().default('Screening Booking'),
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
