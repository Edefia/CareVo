import type { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service.js';

export const auditController = {
  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters = {
        actorId: req.query.actorId,
        action: req.query.action,
        resourceType: req.query.resourceType,
        resourceId: req.query.resourceId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const paginatedData = await AuditService.getLogs(filters, page, limit);
      res.status(200).json(paginatedData);
    } catch (error) {
      next(error);
    }
  },
};
