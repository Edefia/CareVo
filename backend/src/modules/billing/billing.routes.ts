import { Router } from 'express';
import { billingController } from './billing.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';
import { validate } from '../../middleware/validate.js';
import { createInvoiceSchema, updateInvoiceStatusSchema } from './billing.schema.js';

export const billingRoutes = Router();

// ─── Paystack Webhook (NO AUTH — Paystack sends directly) ───
// This MUST come before the authenticate middleware
billingRoutes.post('/webhook', billingController.handleWebhook);

// ─── Authenticated Routes ───
billingRoutes.use(authenticate);

// Admin / System routes
billingRoutes.post('/', authorize([PERMISSIONS.PAYMENTS_READ_ALL]), validate(createInvoiceSchema), billingController.createInvoice);
billingRoutes.get('/stats', authorize([PERMISSIONS.PAYMENTS_READ_ALL]), billingController.getBillingStats);
billingRoutes.get('/', authorize([PERMISSIONS.PAYMENTS_READ_OWN, PERMISSIONS.PAYMENTS_READ_ALL]), billingController.getInvoices);
billingRoutes.get('/:id', authorize([PERMISSIONS.PAYMENTS_READ_OWN, PERMISSIONS.PAYMENTS_READ_ALL]), billingController.getInvoiceById);

// Update status (Admin/System)
billingRoutes.patch('/:id/status', authorize([PERMISSIONS.PAYMENTS_READ_ALL]), validate(updateInvoiceStatusSchema), billingController.updateInvoiceStatus);

// Admin payment workflows
billingRoutes.post('/:id/verify', authorize([PERMISSIONS.PAYMENTS_READ_ALL]), billingController.verifyPayment);
billingRoutes.post('/:id/manual-pay', authorize([PERMISSIONS.PAYMENTS_READ_ALL]), billingController.recordManualPayment);

// Initiate Payment (Client or Admin on behalf of client) — now uses Paystack
billingRoutes.post('/:id/pay', authorize([PERMISSIONS.PAYMENTS_READ_OWN, PERMISSIONS.PAYMENTS_READ_ALL]), billingController.initiatePayment);
