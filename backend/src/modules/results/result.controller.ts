import type { Request, Response, NextFunction } from 'express';
import { resultService } from './result.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const resultController = {
  async createResult(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await resultService.createResult(
        req.body,
        req.user!.id,
        req.user!.laboratoryId!,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  },

  async getResults(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const patientIdFilter = req.query.patientId as string | undefined;
      const statusFilter = req.query.status as string | undefined;
      const testStatusFilter = req.query.testStatus as string | undefined;
      const referralCodeFilter = req.query.referralCode as string | undefined;

      const userLabId = req.user!.role !== 'ADMIN' ? req.user!.laboratoryId : null;

      const paginatedData = await resultService.getResults(
        page,
        limit,
        req.user!.role,
        req.user!.id,
        userLabId,
        patientIdFilter,
        statusFilter,
        testStatusFilter,
        referralCodeFilter
      );
      res.status(200).json(paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async getResultById(req: Request, res: Response, next: NextFunction) {
    try {
      const userLabId = req.user!.role !== 'ADMIN' ? req.user!.laboratoryId : null;
      const result = await resultService.getResultById(
        req.params.id as string,
        req.user!.role,
        req.user!.id,
        userLabId
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async updateResult(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await resultService.updateResult(
        req.params.id as string,
        req.body,
        req.user!.id,
        req.user!.laboratoryId!,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async submitForApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await resultService.submitForApproval(
        req.params.id as string,
        req.body,
        req.user!.id,
        req.user!.laboratoryId!,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await resultService.updateStatus(
        req.params.id as string,
        req.body.status,
        req.user!.id,
        req.user!.laboratoryId!,
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
