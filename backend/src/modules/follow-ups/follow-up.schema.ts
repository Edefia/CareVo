import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// ─── Create Follow-Up (Interpreter only) ────────────────────────────────────
export const createFollowUpSchema = z.object({
  body: z.object({
    clientId: z.string().regex(objectIdRegex, 'Invalid client ID'),
    resultId: z.string().regex(objectIdRegex, 'Invalid result ID'),
    interpretationId: z.string().regex(objectIdRegex, 'Invalid interpretation ID'),
    type: z.enum([
      'FURTHER_TESTING',
      'MEDICATION_REFERRAL',
      'CLINICIAN_APPOINTMENT',
      'FACILITY_TRANSFER',
    ]),
    urgency: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']),
    facility: z.string().max(300).optional().nullable().default(null),
    notes: z.string().min(1, 'Notes are required').max(800, 'Notes must be 800 characters or fewer'),
  }),
});

// ─── Acknowledge Follow-Up (Client only) ────────────────────────────────────
export const acknowledgeFollowUpSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid follow-up ID'),
  }),
});

// ─── Update Follow-Up Status (Admin/Interpreter) ────────────────────────────
export const updateFollowUpStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid follow-up ID'),
  }),
  body: z.object({
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CLOSED']),
  }),
});
