import type { Request, Response, NextFunction } from 'express';
import { staffService } from './staff.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const staffController = {
  async inviteStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, role, laboratoryId } = req.body;
      const inviterId = req.user!.id;
      
      // If the inviter is lab scoped, enforce their lab ID
      let finalLaboratoryId = laboratoryId;
      if (req.user!.laboratoryId) {
        finalLaboratoryId = req.user!.laboratoryId;
      }

      await staffService.inviteStaff(email, role, inviterId, finalLaboratoryId);
      sendSuccess(res, { message: 'Invitation sent successfully' }, 201);
    } catch (error) {
      next(error);
    }
  },

  async acceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password, firstName, lastName } = req.body;
      const user = await staffService.acceptInvite(token, password, firstName, lastName);
      sendSuccess(res, {
        message: 'Invitation accepted successfully',
        user: { id: user._id, email: user.email, role: user.role }
      });
    } catch (error) {
      next(error);
    }
  },

  async getStaffMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const laboratoryIdFilter = req.query.laboratoryId as string | undefined;

      const paginatedData = await staffService.getStaffMembers(
        page,
        limit,
        laboratoryIdFilter,
        req.user!.laboratoryId,
        req.user!.role
      );
      res.status(200).json(paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async deactivateStaff(req: Request, res: Response, next: NextFunction) {
    try {
      await staffService.deactivateStaff(req.params.userId, req.user!.laboratoryId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
