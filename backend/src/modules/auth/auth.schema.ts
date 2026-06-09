import { z } from 'zod';
import { STAFF_ROLES } from '../../shared/constants/roles.js';

// Password complexity: min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

const passwordField = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const registerSchema = z.strictObject({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: passwordField,
  firstName: z.string().min(2, 'First name is required').trim(),
  lastName: z.string().min(2, 'Last name is required').trim(),
  phone: z.string().optional(),
});

export const loginSchema = z.strictObject({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const mfaVerifySchema = z.strictObject({
  code: z.string().length(6, 'MFA code must be exactly 6 digits').regex(/^\d+$/, 'MFA code must be numeric'),
  token: z.string().min(1, 'MFA token is required'), // Temporary token passed from login
});

export const inviteSchema = z.strictObject({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  role: z.enum(STAFF_ROLES as [string, ...string[]]),
  laboratoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid laboratory ID').optional(),
});

export const inviteAcceptSchema = z.strictObject({
  token: z.string().min(1, 'Token is required'),
  password: passwordField,
  firstName: z.string().min(2, 'First name is required').trim(),
  lastName: z.string().min(2, 'Last name is required').trim(),
  phone: z.string().optional(),
});

export const passwordResetRequestSchema = z.strictObject({
  email: z.string().email().trim().toLowerCase(),
});

export const passwordResetSchema = z.strictObject({
  token: z.string().min(1),
  newPassword: passwordField,
});
