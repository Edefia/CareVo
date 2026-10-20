import { Router } from 'express';
import { healthAccountController } from './health-account.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { exportToHealthAccountSchema, deleteParameterSchema } from './health-account.schema.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const healthAccountRoutes = Router();

// All health-account routes require authentication
healthAccountRoutes.use(authenticate);

// GET /api/v1/health-account/me — get all tracked health data
healthAccountRoutes.get(
  '/me',
  authorize([PERMISSIONS.PATIENTS_READ_OWN]),
  healthAccountController.getMyHealthAccount
);

// POST /api/v1/health-account/export — export parameters from a result
healthAccountRoutes.post(
  '/export',
  authorize([PERMISSIONS.PATIENTS_READ_OWN]),
  validate(exportToHealthAccountSchema),
  healthAccountController.exportParameters
);

// GET /api/v1/health-account/export-history — get export event log
healthAccountRoutes.get(
  '/export-history',
  authorize([PERMISSIONS.PATIENTS_READ_OWN]),
  healthAccountController.getExportHistory
);

// DELETE /api/v1/health-account/parameter/:parameterKey — remove tracking
healthAccountRoutes.delete(
  '/parameter/:parameterKey',
  authorize([PERMISSIONS.PATIENTS_READ_OWN]),
  validate(deleteParameterSchema),
  healthAccountController.removeParameter
);

// GET /api/v1/health-account/stats — Admin/Interpreter gets health account metrics
healthAccountRoutes.get(
  '/stats',
  authorize([PERMISSIONS.PATIENTS_READ_ANY]),
  healthAccountController.getHealthAccountStats
);
