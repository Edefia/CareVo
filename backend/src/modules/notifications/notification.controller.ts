import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/apiResponse.js';
import { NotificationPreferenceModel } from './notification-preference.model.js';
import { SubscriptionModel } from './subscription.model.js';
import { PatientModel } from '../patients/patient.model.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../../shared/errors/index.js';

export const notificationController = {
  async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      let prefs = await NotificationPreferenceModel.findOne({ userId: req.user!.id });
      if (!prefs) {
        // Create default preferences if none exist
        prefs = await NotificationPreferenceModel.create({ userId: req.user!.id });
      }
      sendSuccess(res, prefs);
    } catch (error) {
      next(error);
    }
  },

  async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      let prefs = await NotificationPreferenceModel.findOne({ userId: req.user!.id });
      if (!prefs) {
        prefs = new NotificationPreferenceModel({ userId: req.user!.id });
      }

      if (typeof req.body.emailEnabled === 'boolean') {
        prefs.emailEnabled = req.body.emailEnabled;
      }
      if (typeof req.body.smsEnabled === 'boolean') {
        prefs.smsEnabled = req.body.smsEnabled;
      }

      await prefs.save();
      sendSuccess(res, prefs);
    } catch (error) {
      next(error);
    }
  },

  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, eventTypes } = req.body;
      const subscriberId = req.user!.id;

      // Verify the patient exists and user has access
      const patient = await PatientModel.findById(patientId);
      if (!patient) {
        throw new NotFoundError('Patient not found');
      }

      // Check if subscriber is lab staff and patient belongs to their lab
      if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'PLATFORM_ADMIN') {
        const isLinked = patient.laboratoryIds.some((id) => id.toString() === req.user!.laboratoryId?.toString());
        if (!isLinked) {
          throw new ForbiddenError('You do not have access to this patient.');
        }
      }

      // Check if subscription already exists
      const existingSub = await SubscriptionModel.findOne({ subscriberId, patientId });
      if (existingSub) {
        throw new ConflictError('You are already subscribed to this patient.');
      }

      const subscription = await SubscriptionModel.create({
        subscriberId,
        patientId,
        eventTypes,
      });

      sendSuccess(res, subscription, 201);
    } catch (error) {
      next(error);
    }
  },

  async getSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const subscriptions = await SubscriptionModel.find({ subscriberId: req.user!.id })
        .populate({ path: 'patientId', populate: { path: 'userId', select: 'firstName lastName email' } });
      sendSuccess(res, subscriptions);
    } catch (error) {
      next(error);
    }
  },

  async deleteSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subId = req.params.id as string;
      const subscription = await SubscriptionModel.findOneAndDelete({ _id: subId, subscriberId: req.user!.id });
      if (!subscription) {
        throw new NotFoundError('Subscription not found');
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
