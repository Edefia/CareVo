import { z } from 'zod';

export const createInvoiceSchema = z.object({
  body: z.object({
    patientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid patient ID'),
    amount: z.number().int().positive('Amount must be a positive integer'),
    currency: z.string().length(3).toUpperCase().default('USD'),
    description: z.string().min(3).max(255),
  }),
});

export const updateInvoiceStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid invoice ID'),
  }),
  body: z.object({
    status: z.enum(['PAID', 'CANCELLED', 'REFUNDED']),
    referenceId: z.string().optional().nullable(),
    paymentGateway: z.enum(['PAYSTACK', 'FLUTTERWAVE', 'HUBTEL', 'MANUAL']).optional().nullable(),
  }),
});
