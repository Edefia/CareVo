import type { Request, Response, NextFunction } from 'express';
import { patientService } from './patient.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const patientController = {
  async createProfile(req: Request, res: Response, next: NextFunction) {
    try {
      let targetUserId = req.user!.id;
      if (req.body.userId && req.user!.role !== 'CLIENT') {
        targetUserId = req.body.userId;
      }

      const createdByLabId = req.user!.role !== 'CLIENT' ? req.user!.laboratoryId : null;

      const patient = await patientService.createProfile(targetUserId, req.body, createdByLabId);
      sendSuccess(res, patient, 201);
    } catch (error) {
      next(error);
    }
  },

  async getPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const laboratoryIdFilter = req.query.laboratoryId as string | undefined;

      const callerLabId = req.user!.role !== 'ADMIN' ? req.user!.laboratoryId : null;

      const paginatedData = await patientService.getPatients(page, limit, laboratoryIdFilter, callerLabId);
      res.status(200).json(paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async getPatientById(req: Request, res: Response, next: NextFunction) {
    try {
      const callerLabId = req.user!.role !== 'ADMIN' ? req.user!.laboratoryId : null;
      const patient = await patientService.getPatientById(req.params.id as string, callerLabId);
      sendSuccess(res, patient);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const callerLabId = req.user!.role !== 'ADMIN' ? req.user!.laboratoryId : null;
      const patient = await patientService.updateProfile(req.params.id as string, req.body, callerLabId);
      sendSuccess(res, patient);
    } catch (error) {
      next(error);
    }
  },
};
