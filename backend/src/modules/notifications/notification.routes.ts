import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { updatePreferencesSchema, createSubscriptionSchema, deleteSubscriptionSchema } from './notification.schema.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const notificationRoutes = Router();

notificationRoutes.use(authenticate);

// Preferences (All authenticated users can manage their own preferences)
notificationRoutes.get('/preferences', notificationController.getPreferences);
notificationRoutes.put('/preferences', validate(updatePreferencesSchema), notificationController.updatePreferences);

// Subscriptions (Require ADVOCATES_MONITOR_PATIENT)
// Actually we can allow anyone with PATIENTS_READ_ANY to subscribe, but let's stick to ADVOCATES_MONITOR_PATIENT or INTERPRETATIONS_CREATE
notificationRoutes.post('/subscriptions', authorize([PERMISSIONS.ADVOCATES_MONITOR_PATIENT, PERMISSIONS.INTERPRETATIONS_CREATE, PERMISSIONS.RESULTS_READ]), validate(createSubscriptionSchema), notificationController.createSubscription);
notificationRoutes.get('/subscriptions', authorize([PERMISSIONS.ADVOCATES_MONITOR_PATIENT, PERMISSIONS.INTERPRETATIONS_CREATE, PERMISSIONS.RESULTS_READ]), notificationController.getSubscriptions);
notificationRoutes.delete('/subscriptions/:id', authorize([PERMISSIONS.ADVOCATES_MONITOR_PATIENT, PERMISSIONS.INTERPRETATIONS_CREATE, PERMISSIONS.RESULTS_READ]), validate(deleteSubscriptionSchema), notificationController.deleteSubscription);
