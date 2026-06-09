import type { Request, Response, NextFunction } from 'express';
import { interpretationService } from './interpretation.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const interpretationController = {
  async createInterpretation(req: Request, res: Response, next: NextFunction) {
    try {
      const interpretation = await interpretationService.createInterpretation(
        req.body,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, interpretation, 201);
    } catch (error) {
      next(error);
    }
  },

  async getInterpretations(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const patientIdFilter = req.query.patientId as string | undefined;

      const paginatedData = await interpretationService.getInterpretations(
        page,
        limit,
        req.user!.role,
        req.user!.id,
        patientIdFilter
      );
      res.status(200).json(paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async getInterpretationById(req: Request, res: Response, next: NextFunction) {
    try {
      const interpretation = await interpretationService.getInterpretationById(
        req.params.id,
        req.user!.role,
        req.user!.id
      );
      sendSuccess(res, interpretation);
    } catch (error) {
      next(error);
    }
  },

  async updateInterpretation(req: Request, res: Response, next: NextFunction) {
    try {
      const interpretation = await interpretationService.updateInterpretation(
        req.params.id,
        req.body,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, interpretation);
    } catch (error) {
      next(error);
    }
  },

  async publishInterpretation(req: Request, res: Response, next: NextFunction) {
    try {
      const interpretation = await interpretationService.publishInterpretation(
        req.params.id,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, interpretation);
    } catch (error) {
      next(error);
    }
  },
};
