import type { Request, Response, NextFunction } from 'express';
import { followUpService } from './follow-up.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const followUpController = {
  /**
   * POST /api/v1/follow-ups
   * Interpreter creates a follow-up for a client.
   */
  async createFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const followUp = await followUpService.createFollowUp(
        req.body,
        req.user!.id
      );
      sendSuccess(res, followUp, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/follow-ups/me
   * Client views their own follow-ups.
   */
  async getMyFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const followUps = await followUpService.getMyFollowUps(req.user!.id);
      sendSuccess(res, followUps);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/follow-ups/:id/acknowledge
   * Client acknowledges a pending follow-up.
   */
  async acknowledgeFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const followUp = await followUpService.acknowledgeFollowUp(
        String(req.params.id),
        req.user!.id
      );
      sendSuccess(res, followUp);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/follow-ups/:id/status
   * Admin/Interpreter updates follow-up status.
   */
  async updateFollowUpStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const followUp = await followUpService.updateFollowUpStatus(
        String(req.params.id),
        req.body.status,
        req.user!.id
      );
      sendSuccess(res, followUp);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/follow-ups/pending-count
   * Client gets count of pending follow-ups (for dashboard widgets).
   */
  async getPendingCount(req: Request, res: Response, next: NextFunction) {
    try {
      const counts = await followUpService.getPendingCount(req.user!.id);
      sendSuccess(res, counts);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/follow-ups
   * Interpreter/Admin gets list of follow-ups.
   */
  async getAllFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string | undefined;
      const followUps = await followUpService.getAllFollowUps(
        req.user!.role,
        req.user!.id,
        status
      );
      sendSuccess(res, followUps);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/follow-ups/overview-stats
   * Returns summary counts for Interpreter/Admin dashboards.
   */
  async getOverviewStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await followUpService.getOverviewStats(
        req.user!.role,
        req.user!.id
      );
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  },
};
