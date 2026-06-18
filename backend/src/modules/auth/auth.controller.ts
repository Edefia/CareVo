import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { env } from '../../config/env.js';

const isProduction = env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  path: '/',
};

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const data = await AuthService.register(req.body, req.ip ?? 'unknown', req.headers['user-agent'] ?? 'unknown');
    sendSuccess(res, data, 201);
  }

  static async login(req: Request, res: Response): Promise<void> {
    const result = await AuthService.login(req.body, req.ip ?? 'unknown', req.headers['user-agent'] ?? 'unknown');

    if (result.mfaRequired) {
      sendSuccess(res, { mfaRequired: true, token: (result as any).token });
      return;
    }

    res.cookie('accessToken', (result as any).accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', (result as any).refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, { user: (result as any).user });
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    const oldRefreshToken = req.cookies?.refreshToken as string | undefined;

    if (!oldRefreshToken) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
      return;
    }

    const tokens = await AuthService.refresh(oldRefreshToken, req.ip ?? 'unknown', req.headers['user-agent'] ?? 'unknown');

    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, { message: 'Tokens refreshed successfully' });
  }

  static async logout(req: Request, res: Response): Promise<void> {
    if (req.user) {
      await AuthService.logout(req.user.id, req.user.sessionId, req.ip ?? 'unknown', req.headers['user-agent'] ?? 'unknown');
    }

    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    sendSuccess(res, { message: 'Logged out successfully' });
  }

  // --- MFA Logic ---

  static async setupMfa(req: Request, res: Response): Promise<void> {
    // Requires authentication (so req.user is available)
    const result = await AuthService.setupMfa(req.user!.id);
    sendSuccess(res, result);
  }

  static async verifyMfaSetup(req: Request, res: Response): Promise<void> {
    const { code } = req.body;
    const result = await AuthService.verifyMfaSetup(
      req.user!.id,
      code,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? 'unknown'
    );
    sendSuccess(res, result);
  }

  static async verifyMfaLogin(req: Request, res: Response): Promise<void> {
    const { token, code } = req.body;
    const result = await AuthService.verifyMfaLogin(
      token,
      code,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? 'unknown'
    );

    res.cookie('accessToken', (result as any).accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', (result as any).refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, { user: (result as any).user });
  }

  static async resendMfaCode(req: Request, res: Response): Promise<void> {
    const { token } = req.body;
    await AuthService.resendMfaCode(token);
    sendSuccess(res, { message: 'MFA code resent successfully' });
  }

  // --- Password Reset ---

  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    // We await but return success regardless to prevent enumeration
    await AuthService.requestPasswordReset(
      email,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? 'unknown'
    );
    sendSuccess(res, { message: 'If that email exists, a reset link has been sent.' });
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;
    await AuthService.resetPassword(
      token,
      newPassword,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? 'unknown'
    );
    sendSuccess(res, { message: 'Password reset successfully.' });
  }
}
