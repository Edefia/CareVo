import { FollowUpModel, type FollowUpType, type FollowUpUrgency } from './follow-up.model.js';
import { UserModel } from '../auth/auth.model.js';
import { ResultRecordModel } from '../results/result.model.js';
import { NotificationModel } from '../notifications/notification.model.js';
import { notificationService } from '../notifications/notification.service.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors/index.js';
import { logger } from '../../utils/logger.js';

interface CreateFollowUpData {
  clientId: string;
  resultId: string;
  interpretationId: string;
  type: FollowUpType;
  urgency: FollowUpUrgency;
  facility?: string | null;
  notes: string;
}

export const followUpService = {
  /**
   * POST /api/v1/follow-ups
   * Creates a new follow-up (Interpreter or Admin only).
   */
  async createFollowUp(data: CreateFollowUpData, interpreterId: string) {
    const followUp = await FollowUpModel.create({
      clientId: data.clientId,
      resultId: data.resultId,
      interpretationId: data.interpretationId,
      interpreterId,
      type: data.type,
      urgency: data.urgency,
      facility: data.facility || null,
      notes: data.notes,
      status: 'PENDING',
    });

    logger.info('Follow-up created', {
      followUpId: followUp._id,
      clientId: data.clientId,
      type: data.type,
      urgency: data.urgency,
      interpreterId,
    });

    // Notify the client via email and SMS
    try {
      const client = await UserModel.findById(data.clientId).lean();
      const result = await ResultRecordModel.findById(data.resultId).lean();
      const testName = result?.panelName || 'screening';
      const notificationMsg = `Your CareBis interpreter has created a follow-up recommendation based on your recent ${testName} results. Log in to view your follow-up care instructions.`;

      if (client) {
        // In-app notification
        await NotificationModel.create({
          recipientId: client._id,
          title: 'Follow-Up Recommendation',
          message: notificationMsg,
          type: 'FOLLOW_UP',
          metadata: {
            followUpId: followUp._id,
            resultId: data.resultId,
            urgency: data.urgency,
          },
        });

        // SMS notification
        if (client.phone) {
          try {
            await notificationService.sendSms(client.phone, notificationMsg);
          } catch (smsError) {
            logger.warn('Failed to send follow-up SMS', { clientId: client._id, error: (smsError as Error).message });
          }
        }

        // Email notification
        if (client.email) {
          try {
            await notificationService.sendEmail(
              client.email,
              `CareBis Prime: Follow-up required for your ${testName}`,
              'notification',
              {
                name: `${client.firstName} ${client.lastName}`,
                message: notificationMsg,
              }
            );
          } catch (emailError) {
            logger.warn('Failed to send follow-up email', { clientId: client._id, error: (emailError as Error).message });
          }
        }
      }
    } catch (notifErr) {
      logger.error('Error during follow-up notification dispatch', { error: (notifErr as Error).message });
    }

    return followUp;
  },

  /**
   * GET /api/v1/follow-ups/me
   * Returns all follow-ups for the authenticated client,
   * sorted by urgency (Emergency first) then createdAt desc.
   */
  async getMyFollowUps(clientId: string) {
    const followUps = await FollowUpModel.find({ clientId })
      .populate('interpreterId', 'firstName lastName email')
      .populate('resultId', 'panelName collectionDate referralCode')
      .sort({ createdAt: -1 })
      .lean();

    // Custom sort: Emergency > Urgent > Routine, then by createdAt desc
    const urgencyOrder: Record<string, number> = {
      EMERGENCY: 0,
      URGENT: 1,
      ROUTINE: 2,
    };

    followUps.sort((a, b) => {
      const urgencyDiff = (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3);
      if (urgencyDiff !== 0) return urgencyDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return followUps;
  },

  /**
   * PATCH /api/v1/follow-ups/:id/acknowledge
   * Changes status from PENDING to ACKNOWLEDGED.
   * Client only — can only acknowledge their own follow-ups.
   */
  async acknowledgeFollowUp(followUpId: string, clientId: string) {
    const followUp = await FollowUpModel.findById(followUpId);

    if (!followUp) {
      throw new NotFoundError('Follow-up not found.');
    }

    if (followUp.clientId.toString() !== clientId) {
      throw new ForbiddenError('You can only acknowledge your own follow-ups.');
    }

    if (followUp.status !== 'PENDING') {
      throw new ForbiddenError('Only PENDING follow-ups can be acknowledged.');
    }

    followUp.status = 'ACKNOWLEDGED';
    followUp.acknowledgedAt = new Date();
    await followUp.save();

    logger.info('Follow-up acknowledged', { followUpId, clientId });

    return followUp;
  },

  /**
   * PATCH /api/v1/follow-ups/:id/status
   * For Admin/Interpreter to update status to IN_PROGRESS, COMPLETED, or CLOSED.
   */
  async updateFollowUpStatus(
    followUpId: string,
    newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED',
    updatedById: string
  ) {
    const followUp = await FollowUpModel.findById(followUpId);

    if (!followUp) {
      throw new NotFoundError('Follow-up not found.');
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      PENDING: ['IN_PROGRESS', 'CLOSED'],
      ACKNOWLEDGED: ['IN_PROGRESS', 'CLOSED'],
      IN_PROGRESS: ['COMPLETED', 'CLOSED'],
      COMPLETED: ['CLOSED'],
      CLOSED: [],
    };

    const allowedNext = validTransitions[followUp.status] || [];
    if (!allowedNext.includes(newStatus)) {
      throw new ForbiddenError(
        `Cannot transition from ${followUp.status} to ${newStatus}.`
      );
    }

    followUp.status = newStatus;

    if (newStatus === 'COMPLETED') {
      followUp.completedAt = new Date();
    }

    await followUp.save();

    logger.info('Follow-up status updated', {
      followUpId,
      newStatus,
      updatedById,
    });

    return followUp;
  },

  /**
   * Get count of pending/urgent follow-ups for a client.
   * Used for dashboard summary cards.
   */
  async getPendingCount(clientId: string) {
    const count = await FollowUpModel.countDocuments({
      clientId,
      status: 'PENDING',
    });

    const emergencyCount = await FollowUpModel.countDocuments({
      clientId,
      status: 'PENDING',
      urgency: 'EMERGENCY',
    });

    const urgentCount = await FollowUpModel.countDocuments({
      clientId,
      status: 'PENDING',
      urgency: 'URGENT',
    });

    return {
      pendingCount: count,
      hasUrgent: urgentCount > 0,
      hasEmergency: emergencyCount > 0,
    };
  },

  /**
   * GET /api/v1/follow-ups
   * Returns all follow-ups for Admin (all) or Interpreter (theirs).
   */
  async getAllFollowUps(role: string, userId: string, status?: string) {
    const filter: Record<string, any> = {};
    if (role === 'INTERPRETER') {
      filter.interpreterId = userId;
    }
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const followUps = await FollowUpModel.find(filter)
      .populate('clientId', 'firstName lastName email phone')
      .populate('interpreterId', 'firstName lastName email')
      .populate('resultId', 'panelName collectionDate referralCode')
      .sort({ createdAt: -1 })
      .lean();

    return followUps;
  },

  /**
   * GET /api/v1/follow-ups/overview-stats
   * Returns summary metrics for Interpreter and Admin dashboards.
   */
  async getOverviewStats(role: string, userId: string) {
    const filter: Record<string, any> = {};
    if (role === 'INTERPRETER') {
      filter.interpreterId = userId;
    }

    const [total, pending, urgent, emergency, inProgress, completed] = await Promise.all([
      FollowUpModel.countDocuments(filter),
      FollowUpModel.countDocuments({ ...filter, status: 'PENDING' }),
      FollowUpModel.countDocuments({ ...filter, urgency: 'URGENT', status: { $ne: 'CLOSED' } }),
      FollowUpModel.countDocuments({ ...filter, urgency: 'EMERGENCY', status: { $ne: 'CLOSED' } }),
      FollowUpModel.countDocuments({ ...filter, status: 'IN_PROGRESS' }),
      FollowUpModel.countDocuments({ ...filter, status: 'COMPLETED' }),
    ]);

    return {
      total,
      pending,
      urgent,
      emergency,
      inProgress,
      completed,
    };
  },
};
