import { UserModel } from '../auth/auth.model.js';
import { NotFoundError, UnauthorizedError, ConflictError } from '../../shared/errors/index.js';
import * as argon2 from 'argon2';
import { AuditService } from '../audit/audit.service.js';

export class UserService {
  static async getProfile(userId: string) {
    const user = await UserModel.findById(userId).select('-passwordHash -mfaSecret -mfaBackupCodes');
    if (!user) throw new NotFoundError('User not found.');
    return user;
  }

  static async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string }, ip: string, userAgent: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    const previousState = {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;

    await user.save();

    const newState = {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };

    await AuditService.log({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: 'user.profile_updated',
      resourceType: 'User',
      resourceId: user._id.toString(),
      previousState,
      newState,
      ipAddress: ip,
      userAgent,
      sessionId: 'none',
      success: true,
    });

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string, ip: string, userAgent: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    const validPassword = await argon2.verify(user.passwordHash, currentPassword);
    if (!validPassword) {
      throw new UnauthorizedError('Incorrect current password.');
    }

    const sameAsOld = await argon2.verify(user.passwordHash, newPassword);
    if (sameAsOld) {
      throw new ConflictError('New password cannot be the same as the old password.');
    }

    const passwordHash = await argon2.hash(newPassword);
    user.passwordHash = passwordHash;
    user.passwordChangedAt = new Date();

    await user.save();

    await AuditService.log({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: 'user.password_changed',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: ip,
      userAgent,
      sessionId: 'none',
      success: true,
    });
  }
}
