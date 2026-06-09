import { z } from 'zod';

export const updateProfileSchema = z.strictObject({
  firstName: z.string().min(2, 'First name is required').trim().optional(),
  lastName: z.string().min(2, 'Last name is required').trim().optional(),
  phone: z.string().optional(),
});

// Password complexity: min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

export const changePasswordSchema = z.strictObject({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(passwordRegex, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
});
