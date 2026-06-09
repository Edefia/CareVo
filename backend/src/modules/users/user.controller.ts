import type { Request, Response } from 'express';
import { UserService } from './user.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export class UserController {
  static async getProfile(req: Request, res: Response): Promise<void> {
    const profile = await UserService.getProfile(req.user!.id);
    sendSuccess(res, profile);
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    const updated = await UserService.updateProfile(
      req.user!.id,
      req.body,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? 'unknown'
    );
    sendSuccess(res, updated);
  }

  static async changePassword(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword } = req.body;
    await UserService.changePassword(
      req.user!.id,
      currentPassword,
      newPassword,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? 'unknown'
    );
    sendSuccess(res, { message: 'Password changed successfully.' });
  }
}
