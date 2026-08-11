import type { Request, Response, NextFunction } from 'express';
import { billingService } from './billing.service.js';
import { paymentService } from './payment.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { logger } from '../../utils/logger.js';

export const billingController = {
  async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await billingService.createInvoice(
        req.body,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, invoice, 201);
    } catch (error) {
      next(error);
    }
  },

  async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const patientIdFilter = req.query.patientId as string | undefined;
      const statusFilter = req.query.status as string | undefined;

      const paginatedData = await billingService.getInvoices(
        page,
        limit,
        req.user!.role,
        req.user!.id,
        patientIdFilter,
        statusFilter
      );
      res.status(200).json(paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await billingService.getInvoiceById(
        req.params.id as string,
        req.user!.role,
        req.user!.id
      );
      sendSuccess(res, invoice);
    } catch (error) {
      next(error);
    }
  },

  async updateInvoiceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await billingService.updateInvoiceStatus(
        req.params.id as string,
        req.body,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, invoice);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Initialize a Paystack payment.
   * Client sends { email, callbackUrl } and receives { authorization_url, access_code, reference }.
   */
  async initiatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, callbackUrl } = req.body;
      if (!email) throw new Error('Email is required for Paystack payment.');

      const response = await billingService.initiatePaystackPayment(
        req.params.id as string,
        email,
        callbackUrl,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Paystack Webhook Handler.
   * This endpoint receives POST requests from Paystack when payment events occur.
   * No authentication — Paystack sends directly. We verify using HMAC signature.
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      // Verify the webhook signature
      const signature = req.headers['x-paystack-signature'] as string;
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      if (!signature || !paymentService.validateWebhookSignature(rawBody, signature)) {
        logger.warn('Invalid Paystack webhook signature received');
        res.status(401).json({ status: false, message: 'Invalid signature' });
        return;
      }

      const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      logger.info('Paystack webhook received', { event: event.event, reference: event.data?.reference });

      const result = await billingService.handlePaystackWebhook(event);

      // Paystack expects a 200 response — always respond quickly
      res.status(200).json({ status: true, ...result });
    } catch (error) {
      logger.error('Paystack webhook processing error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Still return 200 to prevent Paystack from retrying
      res.status(200).json({ status: true, message: 'Webhook received with processing error' });
    }
  },

  // ===================== ADMIN ENDPOINTS =====================

  async getBillingStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await billingService.getBillingStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  },

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await billingService.verifyPaymentStatus(
        req.params.id as string,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async recordManualPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentMethod, referenceNote } = req.body;
      const result = await billingService.recordManualPayment(
        req.params.id as string,
        paymentMethod || 'CASH',
        referenceNote || '',
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
};
