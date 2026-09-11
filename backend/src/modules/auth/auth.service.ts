import { UserModel } from './auth.model.js';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../shared/errors/index.js';
import * as argon2 from 'argon2';

import * as otplib from 'otplib';
const { authenticator } = otplib;
import { generateSessionId, signAccessToken, signRefreshToken, verifyRefreshToken, generateSecureToken, hashToken } from '../../utils/token.js';
import { AuditService } from '../audit/audit.service.js';
import { notificationService } from '../notifications/notification.service.js';
import { ROLES, type Role } from '../../shared/constants/roles.js';
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

function getOtpEmailTemplate(code: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px; color: #111827; }
    .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb; }
    .header { background-color: #042F64; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.025em; font-family: Georgia, serif; }
    .header span.prime { color: #4988CF; font-family: 'Inter', sans-serif; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 32px; text-align: center; }
    .title { font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 12px; color: #111827; }
    .message { font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 32px; }
    
    .otp-container { 
      background-color: #eff6ff; 
      border: 2px dashed #93c5fd; 
      border-radius: 12px; 
      padding: 32px 24px; 
      margin-bottom: 32px; 
    }
    
    .otp-code { 
      font-size: 42px; 
      font-weight: 800; 
      letter-spacing: 0.25em; 
      color: #1e40af; 
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    
    .copy-hint {
      display: inline-block;
      margin-top: 20px;
      font-size: 13px;
      color: #1d4ed8;
      background-color: #dbeafe;
      padding: 8px 16px;
      border-radius: 9999px;
      font-weight: 600;
    }
    
    .footer { padding: 24px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 0; font-size: 13px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CareBis <span class="prime">Prime</span></h1>
    </div>
    <div class="content">
      <h2 class="title">Secure Login Code</h2>
      <p class="message">Please use the verification code below to sign in. This code is valid for <strong>5 minutes</strong>.</p>
      
      <div class="otp-container">
        <p class="otp-code">${code}</p>
        <div class="copy-hint">Double-click code to copy</div>
      </div>
      
      <p class="message" style="font-size: 14px; margin-bottom: 0;">If you didn't request this code, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} CareBis Prime Health. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export class AuthService {
  static async register(data: Record<string, unknown>, ip: string, userAgent: string) {
    const existing = await UserModel.findOne({ email: data.email as string });
    if (existing) {
      throw new ConflictError('Email already in use.');
    }

    const passwordHash = await argon2.hash(data.password as string);

    const user = await UserModel.create({
      email: data.email as string,
      passwordHash,
      role: ROLES.CLIENT, // Only clients can self-register
      firstName: data.firstName as string,
      lastName: data.lastName as string,
      phone: data.phone as string,
    });

    await AuditService.log({
      actorId: user._id.toString(),
      actorRole: ROLES.CLIENT,
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
    const mfaRequired = user.mfaEnabled;

    if (mfaRequired) {
      // Issue temporary token for MFA step
      const tempToken = generateSecureToken();
      const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const cacheData = JSON.stringify({ userId: user._id.toString(), emailCode });
      setCache(`mfa:temp:${tempToken}`, cacheData, 300); // 5 min expiry

      await notificationService.sendEmail(
        user.email,
        'CareBis Prime Login Code',
        getOtpEmailTemplate(emailCode)
      );

      return { mfaRequired: true, token: tempToken };
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
    } catch {
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
    const otpauthUrl = authenticator.keyuri(user.email, 'CareBis Prime', secret);

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

  static async resendMfaCode(tempToken: string) {
    const cacheStr = getCache(`mfa:temp:${tempToken}`);
    if (!cacheStr) {
      throw new UnauthorizedError('Invalid or expired MFA token. Please log in again.');
    }
    
    const cacheData = JSON.parse(cacheStr);
    const user = await UserModel.findById(cacheData.userId);
    if (!user) throw new NotFoundError('User not found.');

    const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
    cacheData.emailCode = emailCode;
    
    setCache(`mfa:temp:${tempToken}`, JSON.stringify(cacheData), 300);

    await notificationService.sendEmail(
      user.email,
      'CareBis Prime Login Code',
      getOtpEmailTemplate(emailCode)
    );
  }

  static async verifyMfaLogin(tempToken: string, code: string, ip: string, userAgent: string) {
    const cacheStr = getCache(`mfa:temp:${tempToken}`);
    
    if (!cacheStr) {
      throw new UnauthorizedError('Invalid or expired MFA token. Please log in again.');
    }
    
    const cacheData = JSON.parse(cacheStr);
    const userId = cacheData.userId;
    const emailCode = cacheData.emailCode;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found.');
    }

    let isValid = false;

    // 1. Check Email OTP
    if (code === emailCode) {
      isValid = true;
    }
    // 2. Check Authenticator App if enabled
    else if (user.mfaEnabled && user.mfaSecret && code.length === 6) {
      const secret = decrypt(user.mfaSecret);
      isValid = authenticator.verify({ token: code, secret });
    }
    // 3. Check Backup Codes
    else if (code.length === 10 && user.mfaBackupCodes && user.mfaBackupCodes.length > 0) {
      for (let i = 0; i < user.mfaBackupCodes.length; i++) {
        if (await argon2.verify(user.mfaBackupCodes[i] as string, code)) {
          isValid = true;
          user.mfaBackupCodes.splice(i, 1);
          await user.save();
          break;
        }
      }
    }

    if (!isValid) {
      throw new UnauthorizedError('Invalid MFA or backup code.');
    }

    delCache(`mfa:temp:${tempToken}`);

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
      'CareBis Prime Password Reset',
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
