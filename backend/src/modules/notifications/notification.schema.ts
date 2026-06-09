import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  body: z.object({
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
  }),
});

export const createSubscriptionSchema = z.object({
  body: z.object({
    patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID'),
    eventTypes: z.array(z.string()).min(1, 'At least one event type is required'),
  }),
});

export const deleteSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subscription ID'),
  }),
});
