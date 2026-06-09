import { Router } from 'express';
import { staffController } from './staff.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { inviteStaffSchema, acceptInviteSchema, getStaffParamsSchema, deactivateStaffSchema } from './staff.schema.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const staffRoutes = Router();

// Public route to accept invitation
staffRoutes.post('/accept-invite', validate(acceptInviteSchema), staffController.acceptInvite);

// Protected routes
staffRoutes.use(authenticate);

// Invite staff requires USERS_INVITE permission
staffRoutes.post('/invite', authorize([PERMISSIONS.USERS_INVITE]), validate(inviteStaffSchema), staffController.inviteStaff);

// List staff
staffRoutes.get('/', validate(getStaffParamsSchema), staffController.getStaffMembers);

// Deactivate staff requires USERS_DEACTIVATE or USERS_INVITE (Lab Admins have this)
staffRoutes.patch('/:userId/deactivate', authorize([PERMISSIONS.USERS_DEACTIVATE, PERMISSIONS.USERS_INVITE]), validate(deactivateStaffSchema), staffController.deactivateStaff);
