import { UserModel, InvitationModel } from './auth.model.js';
import { AppError, ConflictError, NotFoundError, UnauthorizedError, ValidationError, ForbiddenError } from '../../shared/errors/index.js';
import * as argon2 from 'argon2';
import * as otplib from 'otplib';
const { authenticator } = otplib;
import { generateSessionId, signAccessToken, signRefreshToken, verifyRefreshToken, generateSecureToken, hashToken } from '../../utils/token.js';
import { AuditService } from '../audit/audit.service.js';
import { notificationService } from '../notifications/notification.service.js';
import { ROLES, MFA_REQUIRED_ROLES, type Role } from '../../shared/constants/roles.js';
import { env } from '../../config/env.js';
import { encrypt, decrypt } from '../../utils/crypto.js';
import { logger } from '../../utils/logger.js';

// In-memory cache to replace Redis for local development/single-instance without Redis
interface CacheEntry {
  value: string;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry>();

function setCache(key: string, value: string, ttlSeconds: number) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

function getCache(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function delCache(key: string) {
  cache.delete(key);
}

function incrCache(key: string): number {
  let val = getCache(key);
  if (!val) val = '0';
  const nextVal = parseInt(val, 10) + 1;
  setCache(key, nextVal.toString(), 60 * 60); // 1 hour TTL for attempts
  return nextVal;
}

function deleteCachePattern(prefix: string) {
  const keysToDelete: string[] = [];
  for (const [key] of cache.entries()) {
    if (key.startsWith(prefix)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(k => cache.delete(k));
}

export class AuthService {
  static async register(data: Record<string, unknown>, ip: string, userAgent: string) {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      throw new ConflictError('Email already in use.');
    }

    const passwordHash = await argon2.hash(data.password as string);

    const user = await UserModel.create({
      email: data.email as string,
      passwordHash,
      role: ROLES.PATIENT, // Only patients can self-register
      firstName: data.firstName as string,
      lastName: data.lastName as string,
      phone: data.phone as string,
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

    // TODO: Send email verification via notificationService

    return { id: user._id, email: user.email, role: user.role };
  }

  static async login(data: Record<string, unknown>, ip: string, userAgent: string) {
    const email = (data.email as string).toLowerCase();

    // Check account lockout
    const lockoutKey = `lockout:${email}`;
    const attemptsKey = `login:attempts:${email}`;
    const isLocked = getCache(lockoutKey);

    if (isLocked) {
      throw new UnauthorizedError('Account temporarily locked due to multiple failed attempts.');
    }

    const user = await UserModel.findOne({ email });

    if (!user || !user.isActive) {
      incrCache(attemptsKey);
      throw new UnauthorizedError('Invalid email or password.');
    }

    const validPassword = await argon2.verify(user.passwordHash, data.password as string);

    if (!validPassword) {
      const attempts = incrCache(attemptsKey);
      if (attempts >= 5) {
        setCache(lockoutKey, '1', 15 * 60); // Lock for 15 mins
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
    delCache(attemptsKey);

    // Check MFA
    const mfaRequired = MFA_REQUIRED_ROLES.includes(user.role) || user.mfaEnabled;

    if (mfaRequired && user.mfaEnabled) {
      // Issue temporary token for MFA step
      const tempToken = generateSecureToken();
      setCache(`mfa:temp:${tempToken}`, user._id.toString(), 300); // 5 min expiry
      return { mfaRequired: true, token: tempToken };
    }

    if (mfaRequired && !user.mfaEnabled) {
      // Force MFA setup
      const tempToken = generateSecureToken();
      setCache(`mfa:setup:${tempToken}`, user._id.toString(), 900); // 15 min expiry for setup
      return { mfaRequired: true, setupRequired: true, token: tempToken };
    }

    return this.createSession(user, ip, userAgent);
  }

  private static async createSession(user: any, ip: string, userAgent: string) {
    const sessionId = generateSessionId();

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

    // Register session in cache (7 days TTL)
    const sessionKey = `session:${user._id.toString()}:${sessionId}`;
    const sessionData = {
      ipAddress: ip,
      userAgent,
      createdAt: new Date().toISOString(),
    };
    setCache(sessionKey, JSON.stringify(sessionData), 7 * 24 * 60 * 60);

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

  static async refresh(refreshToken: string, _ip: string, _userAgent: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      const sessionKey = `session:${payload.userId}:${payload.sessionId}`;
      const sessionExists = getCache(sessionKey);

      // In-memory cache is ephemeral so we shouldn't strictly crash if it resets.
      // But for completeness we follow the old logic.
      if (!sessionExists) {
        // Token reuse / revoked session detected
        logger.warn(`Token reuse or revoked session detected for user ${payload.userId}`);
        throw new UnauthorizedError('Session revoked.');
      }

      // Generate new tokens (Rotation)
      const newAccessToken = signAccessToken(payload);
      const newRefreshToken = signRefreshToken(payload);

      // Extend session TTL in memory cache
      setCache(sessionKey, sessionExists, 7 * 24 * 60 * 60);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }
  }

  static async logout(userId: string, sessionId: string, ip: string, userAgent: string) {
    const sessionKey = `session:${userId}:${sessionId}`;
    delCache(sessionKey);

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
    // Check both login token and setup token
    let userId = getCache(`mfa:temp:${tempToken}`);
    let isSetup = false;
    
    if (!userId) {
      userId = getCache(`mfa:setup:${tempToken}`);
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
        if (await argon2.verify(user.mfaBackupCodes[i] as string, code)) {
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
      delCache(`mfa:setup:${tempToken}`);
    } else {
      delCache(`mfa:temp:${tempToken}`);
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
    
    // Save hashed token in memory cache with 15 minute expiry
    setCache(`reset:${tokenHash}`, user._id.toString(), 15 * 60);

    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    await notificationService.sendEmail(
      user.email,
      'CareVo Password Reset',
      `<p>Click <a href="${resetLink}">here</a> to reset your password. Valid for 15 minutes.</p>`
    );

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
    const userId = getCache(`reset:${tokenHash}`);

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
    delCache(`reset:${tokenHash}`);

    // Invalidate all existing sessions for this user to force re-login
    deleteCachePattern(`session:${userId}:`);

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
