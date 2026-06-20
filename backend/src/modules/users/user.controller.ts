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

  static async uploadAvatar(req: Request, res: Response): Promise<void> {
    const { avatarBase64 } = req.body;
    const result = await UserService.uploadAvatar(
      req.user!.id,
      avatarBase64,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? 'unknown'
    );
    sendSuccess(res, result);
  }

  // ===================== ADMIN ENDPOINTS =====================

  static async getAllUsers(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    const result = await UserService.getAllUsers(page, limit, role, search, status);
    res.status(200).json(result);
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    const user = await UserService.getUserById(req.params.id as string);
    sendSuccess(res, user);
  }

  static async updateUserStatus(req: Request, res: Response): Promise<void> {
    const { isActive } = req.body;
    const result = await UserService.updateUserStatus(
      req.params.id as string,
      isActive,
      req.user!.id,
      req.user!.role,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? 'unknown'
    );
    sendSuccess(res, result);
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    await UserService.softDeleteUser(
      req.params.id as string,
      req.user!.id,
      req.user!.role,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? 'unknown'
    );
    res.status(204).send();
  }

  static async getUserCounts(_req: Request, res: Response): Promise<void> {
    const counts = await UserService.getUserCounts();
    sendSuccess(res, counts);
  }
}
