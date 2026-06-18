import { Router } from 'express';
import { analyticsController } from './analytics.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const analyticsRoutes = Router();

analyticsRoutes.use(authenticate);

// Get dashboard metrics (Staff only)
analyticsRoutes.get('/dashboard', authorize([PERMISSIONS.PATIENTS_READ_ANY]), analyticsController.getDashboardMetrics);

// Get revenue chart data (Admin only)
analyticsRoutes.get('/revenue-chart', authorize([PERMISSIONS.PAYMENTS_READ_ALL]), analyticsController.getRevenueChart);

// Get booking statistics and lab performance (Admin only)
analyticsRoutes.get('/booking-stats', authorize([PERMISSIONS.PATIENTS_READ_ANY]), analyticsController.getBookingStats);
