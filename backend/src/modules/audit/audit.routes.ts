import { Router } from 'express';
import { auditController } from './audit.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const auditRoutes = Router();

auditRoutes.use(authenticate);

// List audit logs
auditRoutes.get('/', authorize([PERMISSIONS.AUDIT_LOGS_READ]), auditController.getLogs);
