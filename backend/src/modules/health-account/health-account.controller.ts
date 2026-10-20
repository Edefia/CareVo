import type { Request, Response, NextFunction } from 'express';
import { healthAccountService } from './health-account.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const healthAccountController = {
  /**
   * GET /api/v1/health-account/me
   */
  async getMyHealthAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await healthAccountService.getMyHealthAccount(req.user!.id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/v1/health-account/export
   */
  async exportParameters(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await healthAccountService.exportParameters(
        req.user!.id,
        req.body.resultId,
        req.body.parameters
      );
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/health-account/parameter/:parameterKey
   */
  async removeParameter(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await healthAccountService.removeParameter(
        req.user!.id,
        String(req.params.parameterKey)
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/health-account/export-history
   */
  async getExportHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await healthAccountService.getExportHistory(req.user!.id);
      sendSuccess(res, events);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/health-account/stats
   */
  async getHealthAccountStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await healthAccountService.getHealthAccountStats();
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  },
};
