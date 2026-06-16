import type { Request, Response, NextFunction } from 'express';
import { advocacyService } from './advocacy.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const advocacyController = {
  async getContent(req: Request, res: Response, next: NextFunction) {
    try {
      const type = req.query.type as 'EDUCATION_CARD' | 'PREVENTIVE_TIP' | undefined;
      const content = await advocacyService.getContent(type);
      sendSuccess(res, content);
    } catch (error) {
      next(error);
    }
  },

  async createContent(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await advocacyService.createContent(
        req.body,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, content, 201);
    } catch (error) {
      next(error);
    }
  },

  async updateContentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const content = await advocacyService.updateContentStatus(
        req.params.id as string,
        req.body.status,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, content);
    } catch (error) {
      next(error);
    }
  },

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await advocacyService.createTask(
        req.body,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, task, 201);
    } catch (error) {
      next(error);
    }
  },

  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters = {
        patientId: req.query.patientId as string | undefined,
        assignedTo: req.query.assignedTo as string | undefined,
        status: req.query.status as string | undefined,
      };

      const paginatedData = await advocacyService.getTasks(page, limit, filters);
      res.status(200).json(paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async getTaskById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await advocacyService.getTaskById(req.params.id as string);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  },

  async updateTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await advocacyService.updateTaskStatus(
        req.params.id as string,
        req.body.status,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  },

  async addTaskNote(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await advocacyService.addTaskNote(
        req.params.id as string,
        req.body.text,
        req.user!.id,
        req.user!.role,
        req.ip || '127.0.0.1',
        req.headers['user-agent'] || 'Unknown'
      );
      sendSuccess(res, task, 201);
    } catch (error) {
      next(error);
    }
  },
};
