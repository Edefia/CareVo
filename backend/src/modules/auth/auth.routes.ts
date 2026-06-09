import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema, mfaVerifySchema, passwordResetRequestSchema, passwordResetSchema } from './auth.schema.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);

// MFA
router.post('/mfa/setup', authenticate, AuthController.setupMfa);
router.post('/mfa/verify-setup', authenticate, AuthController.verifyMfaSetup);
router.post('/mfa/verify-login', authLimiter, validate(mfaVerifySchema), AuthController.verifyMfaLogin);

// Password Reset
router.post('/password-reset/request', authLimiter, validate(passwordResetRequestSchema), AuthController.requestPasswordReset);
router.post('/password-reset', authLimiter, validate(passwordResetSchema), AuthController.resetPassword);

export const authRoutes = router;
