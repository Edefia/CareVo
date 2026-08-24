import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { UserModel } from '../auth/auth.model.js';
import { InvitationModel } from '../auth/auth.model.js';
import { LaboratoryModel } from '../laboratories/laboratory.model.js';
import { ConflictError, NotFoundError, ValidationError } from '../../shared/errors/index.js';
import { notificationService } from '../notifications/notification.service.js';
import { env } from '../../config/env.js';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';
import type { Role } from '../../shared/constants/roles.js';

export const staffService = {
  async inviteStaff(
    email: string,
    role: Role,
    inviterId: string,
    laboratoryId?: string
  ): Promise<void> {
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists.');
    }

    if (laboratoryId) {
      const labExists = await LaboratoryModel.findById(laboratoryId);
      if (!labExists) {
        throw new NotFoundError('Laboratory not found.');
      }
    }

    // Check if an invitation already exists
    const existingInvite = await InvitationModel.findOne({ email: email.toLowerCase() });
    if (existingInvite) {
      await InvitationModel.deleteOne({ _id: existingInvite._id });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours

    await InvitationModel.create({
      email: email.toLowerCase(),
      role,
      laboratoryId: laboratoryId || null,
      invitedBy: new mongoose.Types.ObjectId(inviterId),
      tokenHash: hashedToken,
      expiresAt,
    });

    // Send email
    await notificationService.sendEmail(
      email.toLowerCase(),
      'CareBis Prime Staff Invitation',
      `<p>You have been invited to join CareBis Prime as a ${role}. Click <a href="${env.FRONTEND_URL}/accept-invite?token=${token}">here</a> to accept your invitation.</p>`
    );
  },

  async acceptInvite(token: string, password: string, firstName: string, lastName: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const invitation = await InvitationModel.findOne({
      tokenHash: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      throw new ValidationError('Invalid or expired invitation token.');
    }

    // Check if user already exists (just in case)
    const existingUser = await UserModel.findOne({ email: invitation.email });
    if (existingUser) {
      await InvitationModel.deleteOne({ _id: invitation._id });
      throw new ConflictError('User already exists.');
    }

    const user = new UserModel({
      email: invitation.email,
      password, // Will be hashed by pre-save hook
      firstName,
      lastName,
      role: invitation.role,
      laboratoryId: invitation.laboratoryId,
      isActive: true,
      emailVerified: true, // Auto-verified because they received the invite link
    });

    await user.save();
    await InvitationModel.deleteOne({ _id: invitation._id });

    return user;
  },

  async getStaffMembers(
    page: number,
    limit: number,
    laboratoryIdFilter?: string,
    callerLaboratoryId?: string | null,
    _callerRole?: string
  ) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    
    // If caller is lab scoped, enforce their lab ID
    if (callerLaboratoryId) {
      query.laboratoryId = callerLaboratoryId;
    } else if (laboratoryIdFilter) {
      // If caller is platform/super admin, allow filtering
      query.laboratoryId = laboratoryIdFilter;
    }

    // Only return staff roles, maybe exclude patients (patients don't have laboratoryId but good to be safe)
    query.role = { $ne: 'CLIENT' };

    const [staff, total] = await Promise.all([
      UserModel.find(query).select('-password -mfaSecret -recoveryCodes -passwordResetToken -passwordResetExpires').skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      UserModel.countDocuments(query),
    ]);

    return createPaginatedResponse(staff, page, limitNum, total);
  },

  async deactivateStaff(userId: string, callerLaboratoryId?: string | null) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (user.role === 'ADMIN') {
      throw new ConflictError('Cannot deactivate Admins through this endpoint.');
    }

    if (callerLaboratoryId && user.laboratoryId?.toString() !== callerLaboratoryId.toString()) {
      throw new ConflictError('You can only deactivate staff within your own laboratory.');
    }

    user.isActive = false;
    await user.save();
  },
};
