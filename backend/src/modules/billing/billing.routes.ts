import { Router } from 'express';
import { billingController } from './billing.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createInvoiceSchema, updateInvoiceStatusSchema } from './billing.schema.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const billingRoutes = Router();

billingRoutes.use(authenticate);

// Create invoice (Staff only)
billingRoutes.post('/invoices', authorize([PERMISSIONS.PAYMENTS_READ_ALL]), validate(createInvoiceSchema), billingController.createInvoice);

// List invoices
billingRoutes.get('/invoices', authorize([PERMISSIONS.PAYMENTS_READ_OWN, PERMISSIONS.PAYMENTS_READ_ALL]), billingController.getInvoices);

// Get invoice by ID
billingRoutes.get('/invoices/:id', authorize([PERMISSIONS.PAYMENTS_READ_OWN, PERMISSIONS.PAYMENTS_READ_ALL]), billingController.getInvoiceById);

// Update status (Staff only, or Webhook later)
billingRoutes.patch('/invoices/:id/status', authorize([PERMISSIONS.PAYMENTS_READ_ALL]), validate(updateInvoiceStatusSchema), billingController.updateInvoiceStatus);
