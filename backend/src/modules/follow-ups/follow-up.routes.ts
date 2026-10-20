import { Router } from 'express';
import { followUpController } from './follow-up.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import {
  createFollowUpSchema,
  acknowledgeFollowUpSchema,
  updateFollowUpStatusSchema,
} from './follow-up.schema.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const followUpRoutes = Router();

// All follow-up routes require authentication
followUpRoutes.use(authenticate);

// POST /api/v1/follow-ups — Interpreter/Admin creates a follow-up
followUpRoutes.post(
  '/',
  authorize([PERMISSIONS.REFERRALS_CREATE]),
  validate(createFollowUpSchema),
  followUpController.createFollowUp
);

// GET /api/v1/follow-ups — Interpreter/Admin gets list of follow-ups
followUpRoutes.get(
  '/',
  authorize([PERMISSIONS.REFERRALS_CREATE, PERMISSIONS.REFERRALS_UPDATE_STATUS]),
  followUpController.getAllFollowUps
);

// GET /api/v1/follow-ups/overview-stats — Interpreter/Admin gets dashboard metrics
followUpRoutes.get(
  '/overview-stats',
  authorize([PERMISSIONS.REFERRALS_CREATE, PERMISSIONS.REFERRALS_UPDATE_STATUS]),
  followUpController.getOverviewStats
);

// GET /api/v1/follow-ups/me — Client gets their follow-ups
followUpRoutes.get(
  '/me',
  authorize([PERMISSIONS.PATIENTS_READ_OWN]),
  followUpController.getMyFollowUps
);

// GET /api/v1/follow-ups/pending-count — Client gets pending count
followUpRoutes.get(
  '/pending-count',
  authorize([PERMISSIONS.PATIENTS_READ_OWN]),
  followUpController.getPendingCount
);

// PATCH /api/v1/follow-ups/:id/acknowledge — Client acknowledges
followUpRoutes.patch(
  '/:id/acknowledge',
  authorize([PERMISSIONS.PATIENTS_READ_OWN]),
  validate(acknowledgeFollowUpSchema),
  followUpController.acknowledgeFollowUp
);

// PATCH /api/v1/follow-ups/:id/status — Admin/Interpreter updates status
followUpRoutes.patch(
  '/:id/status',
  authorize([PERMISSIONS.REFERRALS_UPDATE_STATUS]),
  validate(updateFollowUpStatusSchema),
  followUpController.updateFollowUpStatus
);
