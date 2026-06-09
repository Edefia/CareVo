import type { Request, Response, NextFunction } from 'express';
import { billingService } from './billing.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

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
        req.params.id,
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
        req.params.id,
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
};
