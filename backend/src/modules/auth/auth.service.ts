import { UserModel, InvitationModel } from './auth.model.js';
import { AppError, ConflictError, NotFoundError, UnauthorizedError, ValidationError, ForbiddenError } from '../../shared/errors/index.js';
import * as argon2 from 'argon2';
import { authenticator } from 'otplib';
import { generateSessionId, signAccessToken, signRefreshToken, verifyRefreshToken, generateSecureToken, hashToken } from '../../utils/token.js';
import { getRedisClient } from '../../config/redis.js';
import { AuditService } from '../audit/audit.service.js';
import { notificationService } from '../notifications/notification.service.js';
import { ROLES, MFA_REQUIRED_ROLES, type Role } from '../../shared/constants/roles.js';
import { env } from '../../config/env.js';
import { encrypt, decrypt } from '../../utils/crypto.js';
import { logger } from '../../utils/logger.js';
import { emailQueue } from '../../jobs/queue.js';

export class AuthService {
  private static async getRedis() {
    return getRedisClient();
  }

  static async register(data: Record<string, unknown>, ip: string, userAgent: string) {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      throw new ConflictError('Email already in use.');
    }

    const passwordHash = await argon2.hash(data.password as string);

    const user = await UserModel.create({
      email: data.email,
      passwordHash,
      role: ROLES.PATIENT, // Only patients can self-register
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
    });

    await AuditService.log({
      actorId: user._id.toString(),
      actorRole: ROLES.PATIENT,
      action: 'user.registered',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: ip,
      userAgent,
      sessionId: 'none',
      success: true,
    });

    // TODO: Queue email verification job

    return { id: user._id, email: user.email, role: user.role };
  }

  static async login(data: Record<string, unknown>, ip: string, userAgent: string) {
    const email = (data.email as string).toLowerCase();
    const redis = await this.getRedis();

    // Check account lockout
    const lockoutKey = `lockout:${email}`;
    const attemptsKey = `login:attempts:${email}`;
    const isLocked = await redis.get(lockoutKey);

    if (isLocked) {
      throw new UnauthorizedError('Account temporarily locked due to multiple failed attempts.');
    }

    const user = await UserModel.findOne({ email });

    if (!user || !user.isActive) {
      await redis.incr(attemptsKey);
      throw new UnauthorizedError('Invalid email or password.');
    }

    const validPassword = await argon2.verify(user.passwordHash, data.password as string);

    if (!validPassword) {
      const attempts = await redis.incr(attemptsKey);
      if (attempts >= 5) {
        await redis.setex(lockoutKey, 15 * 60, '1'); // Lock for 15 mins
        await AuditService.log({
          actorId: user._id.toString(),
          actorRole: user.role,
          action: 'user.locked',
          resourceType: 'User',
          resourceId: user._id.toString(),
          ipAddress: ip,
          userAgent,
          sessionId: 'none',
          success: true,
        });
      }
      throw new UnauthorizedError('Invalid email or password.');
    }

    // Success — clear failed attempts
    await redis.del(attemptsKey);

    // Check MFA
    const mfaRequired = MFA_REQUIRED_ROLES.includes(user.role) || user.mfaEnabled;

    if (mfaRequired && user.mfaEnabled) {
      // Issue temporary token for MFA step
      const tempToken = generateSecureToken();
      await redis.setex(`mfa:temp:${tempToken}`, 300, user._id.toString()); // 5 min expiry
      return { mfaRequired: true, token: tempToken };
    }

    if (mfaRequired && !user.mfaEnabled) {
      // Force MFA setup
      const tempToken = generateSecureToken();
      await redis.setex(`mfa:setup:${tempToken}`, 900, user._id.toString()); // 15 min expiry for setup
      return { mfaRequired: true, setupRequired: true, token: tempToken };
    }

    return this.createSession(user, ip, userAgent);
  }

  private static async createSession(user: any, ip: string, userAgent: string) {
    const sessionId = generateSessionId();
    const redis = await this.getRedis();

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as Role,
      laboratoryId: user.laboratoryId?.toString() ?? null,
      organisationId: user.organisationId?.toString() ?? null,
      sessionId,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Register session in Redis (7 days TTL)
    const sessionKey = `session:${user._id.toString()}:${sessionId}`;
    const sessionData = {
      ipAddress: ip,
      userAgent,
      createdAt: new Date().toISOString(),
    };
    await redis.setex(sessionKey, 7 * 24 * 60 * 60, JSON.stringify(sessionData));

    // Update last login
    await UserModel.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

    await AuditService.log({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: 'user.login',
      resourceType: 'Session',
      resourceId: sessionId,
      ipAddress: ip,
      userAgent,
      sessionId,
      success: true,
    });

    return {
      mfaRequired: false,
      accessToken,
      refreshToken,
      user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    };
  }

  static async refresh(refreshToken: string, ip: string, userAgent: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const redis = await this.getRedis();

      const sessionKey = `session:${payload.userId}:${payload.sessionId}`;
      const sessionExists = await redis.exists(sessionKey);

      if (!sessionExists) {
        // Token reuse / revoked session detected
        logger.warn(`Token reuse or revoked session detected for user ${payload.userId}`);
        throw new UnauthorizedError('Session revoked.');
      }

      // Generate new tokens (Rotation)
      const newAccessToken = signAccessToken(payload);
      const newRefreshToken = signRefreshToken(payload);

      // Extend session TTL in Redis
      await redis.expire(sessionKey, 7 * 24 * 60 * 60);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }

  static async logout(userId: string, sessionId: string, ip: string, userAgent: string) {
    const redis = await this.getRedis();
    const sessionKey = `session:${userId}:${sessionId}`;
    await redis.del(sessionKey);

    await AuditService.log({
      actorId: userId,
      actorRole: 'UNKNOWN', // Doesn't matter here
      action: 'user.logout',
      resourceType: 'Session',
      resourceId: sessionId,
      ipAddress: ip,
      userAgent,
      sessionId,
      success: true,
    });
  }

  // --- MFA Logic ---

  static async setupMfa(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) throw new NotFoundError('User not found.');
    if (user.mfaEnabled) throw new ConflictError('MFA is already enabled.');

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'CareVo', secret);

    // Encrypt the secret before saving
    user.mfaSecret = encrypt(secret);
    await user.save();

    return { otpauthUrl };
  }

  static async verifyMfaSetup(userId: string, code: string, ip: string, userAgent: string) {
    const user = await UserModel.findById(userId);
    if (!user || !user.mfaSecret) throw new NotFoundError('User or MFA secret not found.');
    if (user.mfaEnabled) throw new ConflictError('MFA is already enabled.');

    const secret = decrypt(user.mfaSecret);
    const isValid = authenticator.verify({ token: code, secret });

    if (!isValid) {
      throw new UnauthorizedError('Invalid MFA code.');
    }

    // Generate 10 backup codes
    const rawBackupCodes = Array.from({ length: 10 }, () => generateSecureToken().substring(0, 10).toUpperCase());
    const hashedBackupCodes = await Promise.all(rawBackupCodes.map(code => argon2.hash(code)));

    user.mfaEnabled = true;
    user.mfaBackupCodes = hashedBackupCodes;
    await user.save();

    await AuditService.log({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: 'user.mfa_enabled',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: ip,
      userAgent,
      sessionId: 'none',
      success: true,
    });

    return { backupCodes: rawBackupCodes };
  }

  static async verifyMfaLogin(tempToken: string, code: string, ip: string, userAgent: string) {
    const redis = await this.getRedis();
    
    // Check both login token and setup token
    let userId = await redis.get(`mfa:temp:${tempToken}`);
    let isSetup = false;
    
    if (!userId) {
      userId = await redis.get(`mfa:setup:${tempToken}`);
      isSetup = true;
    }

    if (!userId) {
      throw new UnauthorizedError('Invalid or expired MFA token. Please log in again.');
    }

    const user = await UserModel.findById(userId);
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedError('MFA is not fully configured for this account.');
    }

    const secret = decrypt(user.mfaSecret);
    
    // Check if it's an authenticator code or a backup code
    let isValid = false;
    
    if (code.length === 6) {
      isValid = authenticator.verify({ token: code, secret });
    } else if (code.length === 10 && user.mfaBackupCodes && user.mfaBackupCodes.length > 0) {
      // Verify backup code
      for (let i = 0; i < user.mfaBackupCodes.length; i++) {
        if (await argon2.verify(user.mfaBackupCodes[i], code)) {
          isValid = true;
          // Consume the backup code
          user.mfaBackupCodes.splice(i, 1);
          await user.save();
          break;
        }
      }
    }

    if (!isValid) {
      throw new UnauthorizedError('Invalid MFA or backup code.');
    }

    // Clear temp token
    if (isSetup) {
      await redis.del(`mfa:setup:${tempToken}`);
    } else {
      await redis.del(`mfa:temp:${tempToken}`);
    }

    return this.createSession(user, ip, userAgent);
  }

  // --- Password Reset Logic ---

  static async requestPasswordReset(email: string, ip: string, userAgent: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    
    // We don't throw an error to prevent email enumeration
    if (!user) return;

    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    
    const redis = await this.getRedis();
    // Save hashed token in Redis with 15 minute expiry
    await redis.setex(`reset:${tokenHash}`, 15 * 60, user._id.toString());

    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    await emailQueue.add('password-reset', {
      to: user.email,
      subject: 'CareVo Password Reset',
      template: '<p>Click <a href="{{link}}">here</a> to reset your password. Valid for 15 minutes.</p>',
      data: { link: resetLink }
    });

    await AuditService.log({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: 'user.password_reset_requested',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: ip,
      userAgent,
      sessionId: 'none',
      success: true,
    });
  }

  static async resetPassword(token: string, newPassword: string, ip: string, userAgent: string) {
    const tokenHash = hashToken(token);
    const redis = await this.getRedis();
    const userId = await redis.get(`reset:${tokenHash}`);

    if (!userId) {
      throw new UnauthorizedError('Invalid or expired password reset token.');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const passwordHash = await argon2.hash(newPassword);
    user.passwordHash = passwordHash;
    user.passwordChangedAt = new Date();
    
    // If they were locked out, unlock them
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    
    await user.save();
    
    // Invalidate token
    await redis.del(`reset:${tokenHash}`);

    // Invalidate all existing sessions for this user to force re-login
    const keys = await redis.keys(`session:${userId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    await AuditService.log({
      actorId: user._id.toString(),
      actorRole: user.role,
      action: 'user.password_reset',
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress: ip,
      userAgent,
      sessionId: 'none',
      success: true,
    });
  }
}
