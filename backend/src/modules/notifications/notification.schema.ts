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
    eventTypes: z.array(z.enum(['RESULT_UPLOADED', 'INTERPRETATION_READY', 'APPOINTMENT_SCHEDULED'])),
  }),
});

export const broadcastNotificationSchema = z.object({
  body: z.object({
    modes: z.array(z.enum(['IN_APP', 'EMAIL', 'SMS'])).min(1, 'Select at least one mode'),
    targetAudience: z.enum(['ALL_USERS', 'SELECTED_USERS', 'EXTERNAL_USERS', 'MY_CLIENTS']),
    userIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).optional(),
    externalContacts: z.array(z.object({
      name: z.string().optional(),
      email: z.string().email('Invalid email').optional(),
      phone: z.string().optional(),
    })).optional(),
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    type: z.string().default('BROADCAST'),
  }).refine((data) => {
    if (data.targetAudience === 'SELECTED_USERS' && (!data.userIds || data.userIds.length === 0)) {
      return false;
    }
    if (data.targetAudience === 'EXTERNAL_USERS' && (!data.externalContacts || data.externalContacts.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: 'Missing required target data (userIds or externalContacts) for selected audience',
  })
});

export const deleteSubscriptionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subscription ID'),
  }),
});
