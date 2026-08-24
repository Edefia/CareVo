import { UserModel } from '../auth/auth.model.js';
import { NotFoundError, UnauthorizedError, ConflictError } from '../../shared/errors/index.js';
import * as argon2 from 'argon2';
import { AuditService } from '../audit/audit.service.js';
import { cloudinary } from '../../config/cloudinary.js';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';
import { AuthService } from '../auth/auth.service.js';

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

  static async uploadAvatar(userId: string, avatarBase64: string, ip: string, userAgent: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    const uploadResponse = await cloudinary.uploader.upload(avatarBase64, {
      folder: 'carebis-prime/avatars',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    const previousAvatar = user.avatarUrl;
    user.avatarUrl = uploadResponse.secure_url;
    await user.save();

    await AuditService.log({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: 'user.avatar_updated',
      resourceType: 'User',
      resourceId: user._id.toString(),
      previousState: { avatarUrl: previousAvatar },
      newState: { avatarUrl: user.avatarUrl },
      ipAddress: ip,
      userAgent,
      sessionId: 'none',
      success: true,
    });

    return { avatarUrl: user.avatarUrl };
  }

  // ===================== ADMIN METHODS =====================

  static async adminCreateUser(data: any, adminId: string, adminRole: string, ip: string, userAgent: string) {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      throw new ConflictError('Email already in use.');
    }

    const passwordHash = await argon2.hash(data.password);

    const user = await UserModel.create({
      email: data.email,
      passwordHash,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      laboratoryId: data.laboratoryId || null,
    });

    await AuditService.log({
      actorId: adminId,
      actorRole: adminRole,
      action: 'user.provisioned',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: ip,
      userAgent,
      sessionId: 'none',
      success: true,
      newState: { role: user.role, email: user.email },
    });

    if (data.sendResetEmail) {
      await AuthService.requestPasswordReset(user.email, ip, userAgent);
    }

    return { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
  }

  static async adminUpdateUser(userId: string, data: any, adminId: string, adminRole: string, ip: string, userAgent: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    if (data.email && data.email !== user.email) {
      const existing = await UserModel.findOne({ email: data.email });
      if (existing) throw new ConflictError('Email already in use.');
      user.email = data.email;
    }

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.role !== undefined) user.role = data.role;
    if (data.laboratoryId !== undefined) user.laboratoryId = data.laboratoryId;

    await user.save();

    await AuditService.log({
      actorId: adminId,
      actorRole: adminRole,
      action: 'user.updated_by_admin',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: ip,
      userAgent,
      sessionId: 'none',
      success: true,
    });

    return { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
  }

  static async getAllUsers(page: number, limit: number, roleFilter?: string, search?: string, statusFilter?: string, laboratoryId?: string) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { deletedAt: null };

    if (roleFilter && roleFilter !== 'ALL') {
      query.role = roleFilter;
    }

    if (statusFilter === 'ACTIVE') {
      query.isActive = true;
    } else if (statusFilter === 'SUSPENDED') {
      query.isActive = false;
    }

    if (laboratoryId) {
      query.laboratoryId = laboratoryId;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select('-passwordHash -mfaSecret -mfaBackupCodes')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      UserModel.countDocuments(query),
    ]);

    return createPaginatedResponse(users, page, limitNum, total);
  }

  static async getUserById(userId: string) {
    const user = await UserModel.findById(userId).select('-passwordHash -mfaSecret -mfaBackupCodes');
    if (!user) throw new NotFoundError('User not found.');
    return user;
  }

  static async updateUserStatus(userId: string, isActive: boolean, adminId: string, adminRole: string, ip: string, userAgent: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    const previousActive = user.isActive;
    user.isActive = isActive;
    await user.save();

    await AuditService.log({
      actorId: adminId,
      actorRole: adminRole,
      action: isActive ? 'user.reactivated' : 'user.suspended',
      resourceType: 'User',
      resourceId: user._id.toString(),
      previousState: { isActive: previousActive },
      newState: { isActive: user.isActive },
      ipAddress: ip,
      userAgent,
      sessionId: 'none',
      success: true,
    });

    return { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive };
  }

  static async softDeleteUser(userId: string, adminId: string, adminRole: string, ip: string, userAgent: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User not found.');

    user.deletedAt = new Date();
    user.isActive = false;
    await user.save();

    await AuditService.log({
      actorId: adminId,
      actorRole: adminRole,
      action: 'user.deleted',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: ip,
      userAgent,
      sessionId: 'none',
      success: true,
    });
  }

  static async getUserCounts() {
    const [total, active, suspended, byRole] = await Promise.all([
      UserModel.countDocuments({ deletedAt: null }),
      UserModel.countDocuments({ deletedAt: null, isActive: true }),
      UserModel.countDocuments({ deletedAt: null, isActive: false }),
      UserModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
    ]);

    const roleMap: Record<string, number> = {};
    byRole.forEach((r) => { roleMap[r._id] = r.count; });

    return { total, active, suspended, byRole: roleMap };
  }
}
