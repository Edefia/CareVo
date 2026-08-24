import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { updatePreferencesSchema, createSubscriptionSchema, deleteSubscriptionSchema, broadcastNotificationSchema } from './notification.schema.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);

// Preferences (All authenticated users can manage their own preferences)
notificationRoutes.get('/preferences', notificationController.getPreferences);
notificationRoutes.put('/preferences', validate(updatePreferencesSchema), notificationController.updatePreferences);

// Subscriptions
notificationRoutes.post('/subscriptions', authorize([PERMISSIONS.ADVOCATES_MONITOR_PATIENT, PERMISSIONS.INTERPRETATIONS_CREATE, PERMISSIONS.RESULTS_READ]), validate(createSubscriptionSchema), notificationController.createSubscription);
notificationRoutes.get('/subscriptions', authorize([PERMISSIONS.ADVOCATES_MONITOR_PATIENT, PERMISSIONS.INTERPRETATIONS_CREATE, PERMISSIONS.RESULTS_READ]), notificationController.getSubscriptions);
notificationRoutes.delete('/subscriptions/:id', authorize([PERMISSIONS.ADVOCATES_MONITOR_PATIENT, PERMISSIONS.INTERPRETATIONS_CREATE, PERMISSIONS.RESULTS_READ]), validate(deleteSubscriptionSchema), notificationController.deleteSubscription);

// --- Advanced Notification System ---

// Send a broadcast (Admin, Lab, Interpreter)
notificationRoutes.post(
  '/broadcast',
  authorize(['ADMIN', 'LAB', 'INTERPRETER']),
  validate(broadcastNotificationSchema),
  notificationController.broadcastNotification
);

// Get User's In-App Notifications
notificationRoutes.get(
  '/',
  notificationController.getNotifications
);

// Mark all as read
notificationRoutes.patch(
  '/read-all',
  notificationController.markAllAsRead
);

// Mark specific as read
notificationRoutes.patch(
  '/:id/read',
  notificationController.markAsRead
);

// Delete specific notification
notificationRoutes.delete(
  '/:id',
  notificationController.deleteNotification
);
