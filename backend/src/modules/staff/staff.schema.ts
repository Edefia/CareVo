import { z } from 'zod';
import { STAFF_ROLES } from '../../shared/constants/roles.js';

export const inviteStaffSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').transform(v => v.toLowerCase()),
    role: z.enum(STAFF_ROLES as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid staff role' }),
    }),
    laboratoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid laboratory ID').optional(),
  }).refine((data) => {
    // If it's a lab-scoped role, laboratoryId must be provided
    const labScopedRoles = ['LAB_ADMIN', 'LAB_STAFF'];
    if (labScopedRoles.includes(data.role) && !data.laboratoryId) {
      return false;
    }
    return true;
  }, {
    message: 'laboratoryId is required for laboratory-scoped roles',
    path: ['laboratoryId'],
  }),
});

export const acceptInviteSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(12, 'Password must be at least 12 characters'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  }),
});

export const getStaffParamsSchema = z.object({
  query: z.object({
    laboratoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid laboratory ID').optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const deactivateStaffSchema = z.object({
  params: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
});
