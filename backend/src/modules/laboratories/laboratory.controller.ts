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

  // --- LAB SERVICES ---
  async getMyLabServices(req: Request, res: Response, next: NextFunction) {
    try {
      const laboratoryId = req.user?.laboratoryId;
      if (!laboratoryId) {
        res.status(403).json({ success: false, message: 'Not assigned to a laboratory' });
        return;
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const paginatedData = await laboratoryService.getLabServices(laboratoryId.toString(), page, limit);
      res.status(200).json(paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async createMyLabService(req: Request, res: Response, next: NextFunction) {
    try {
      const laboratoryId = req.user?.laboratoryId;
      if (!laboratoryId) {
        res.status(403).json({ success: false, message: 'Not assigned to a laboratory' });
        return;
      }
      
      const service = await laboratoryService.createLabService(laboratoryId.toString(), req.body);
      sendSuccess(res, service, 201);
    } catch (error) {
      next(error);
    }
  },

  async updateMyLabService(req: Request, res: Response, next: NextFunction) {
    try {
      const laboratoryId = req.user?.laboratoryId;
      if (!laboratoryId) {
        res.status(403).json({ success: false, message: 'Not assigned to a laboratory' });
        return;
      }
      
      const isAdmin = req.user?.role === 'ADMIN';
      const service = await laboratoryService.updateLabService(req.params.id as string, laboratoryId.toString(), req.body, isAdmin);
      sendSuccess(res, service);
    } catch (error) {
      next(error);
    }
  },

  async deleteMyLabService(req: Request, res: Response, next: NextFunction) {
    try {
      const laboratoryId = req.user?.laboratoryId;
      if (!laboratoryId) {
        res.status(403).json({ success: false, message: 'Not assigned to a laboratory' });
        return;
      }
      
      await laboratoryService.deleteLabService(req.params.id as string, laboratoryId.toString());
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // --- ADMIN LAB SERVICES ---
  async getAllLabServices(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const paginatedData = await laboratoryService.getAllLabServices(page, limit);
      res.status(200).json(paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async updateLabServiceStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await laboratoryService.updateLabServiceStatus(req.params.id as string, req.body);
      sendSuccess(res, service);
    } catch (error) {
      next(error);
    }
  }
};
