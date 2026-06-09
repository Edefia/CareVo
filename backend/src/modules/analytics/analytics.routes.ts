import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const analyticsRoutes = Router();

analyticsRoutes.use(authenticate);

// Get dashboard metrics (Staff only)
analyticsRoutes.get('/dashboard', authorize([PERMISSIONS.PATIENTS_READ_ANY]), analyticsController.getDashboardMetrics);
