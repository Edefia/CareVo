import type { Request, Response, NextFunction } from 'express';
import { laboratoryService } from './laboratory.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const laboratoryController = {
  async createLaboratory(req: Request, res: Response, next: NextFunction) {
    try {
      const laboratory = await laboratoryService.createLaboratory(req.body);
      sendSuccess(res, laboratory, 201);
    } catch (error) {
      next(error);
    }
  },

  async getLaboratories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const paginatedData = await laboratoryService.getLaboratories(page, limit);
      res.status(200).json(paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async getLaboratoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const laboratory = await laboratoryService.getLaboratoryById(req.params.id as string);
      sendSuccess(res, laboratory);
    } catch (error) {
      next(error);
    }
  },

  async updateLaboratory(req: Request, res: Response, next: NextFunction) {
    try {
      const laboratory = await laboratoryService.updateLaboratory(req.params.id as string, req.body);
      sendSuccess(res, laboratory);
    } catch (error) {
      next(error);
    }
  },

  async deleteLaboratory(req: Request, res: Response, next: NextFunction) {
    try {
      await laboratoryService.deleteLaboratory(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
