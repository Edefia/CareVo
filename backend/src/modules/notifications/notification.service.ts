import { ResendEmailService } from './email.adapter.js';
import { MoolreSmsService } from './sms.adapter.js';
import type { IEmailService, ISmsService, INotificationPayload } from './notification.interfaces.js';
import { logger } from '../../utils/logger.js';
import { NotificationModel } from './notification.model.js';
import { UserModel } from '../auth/auth.model.js';
import { PatientModel } from '../patients/patient.model.js';
import { InterpretationModel } from '../interpretations/interpretation.model.js';
import { getIO } from '../../config/socket.js';
import mongoose from 'mongoose';

export interface BroadcastPayload {
  modes: ('IN_APP' | 'EMAIL' | 'SMS')[];
  targetAudience: 'ALL_USERS' | 'SELECTED_USERS' | 'EXTERNAL_USERS' | 'MY_CLIENTS';
  userIds?: string[];
  externalContacts?: { name?: string; email?: string; phone?: string }[];
  title: string;
  message: string;
  type?: string;
  sender: { id: string; role: string; laboratoryId?: string };
}

export class NotificationService {
  private readonly emailService: IEmailService;
  private readonly smsService: ISmsService;

  constructor() {
    this.emailService = new ResendEmailService();
    this.smsService = new MoolreSmsService();
  }

  async sendEmail(to: string, subject: string, template: string, data: Record<string, unknown> = {}): Promise<void> {
    await this.emailService.send(to, subject, template, data);
  }

  async sendSms(to: string, message: string): Promise<void> {
    await this.smsService.send(to, message);
  }

  async dispatch(payload: INotificationPayload): Promise<void> {
    switch (payload.type) {
      case 'email':
        if (!payload.subject || !payload.template) {
          logger.error('Email notification missing subject or template', { to: payload.to });
          return;
        }
        await this.sendEmail(payload.to, payload.subject, payload.template, payload.data ?? {});
        break;
      case 'sms':
        if (!payload.message) {
          logger.error('SMS notification missing message', { to: payload.to });
          return;
        }
        await this.sendSms(payload.to, payload.message);
        break;
      default:
        logger.error('Unknown notification type', { payload });
    }
  }

  async broadcast(payload: BroadcastPayload): Promise<void> {
    let resolvedUsers: any[] = [];
    let externalContacts = payload.externalContacts || [];

    // 1. Audience Resolution
    if (payload.targetAudience === 'ALL_USERS') {
      resolvedUsers = await UserModel.find({ isActive: true }).select('_id email phone firstName lastName');
    } else if (payload.targetAudience === 'SELECTED_USERS' && payload.userIds) {
      resolvedUsers = await UserModel.find({ _id: { $in: payload.userIds }, isActive: true }).select('_id email phone firstName lastName');
    } else if (payload.targetAudience === 'MY_CLIENTS') {
      if (payload.sender.role === 'LAB' && payload.sender.laboratoryId) {
        // Find patients linked to this lab
        const patients = await PatientModel.find({ laboratoryIds: payload.sender.laboratoryId }).select('userId');
        const userIds = patients.map((p) => p.userId);
        resolvedUsers = await UserModel.find({ _id: { $in: userIds }, isActive: true }).select('_id email phone firstName lastName');
      } else if (payload.sender.role === 'INTERPRETER') {
        // Find interpretations linked to this interpreter
        const interpretations = await InterpretationModel.find({ interpreterId: payload.sender.id }).populate({
          path: 'resultId',
          populate: {
            path: 'bookingId',
            populate: { path: 'patientId', select: 'userId' }
          }
        });
        
        const userIds = new Set<string>();
        interpretations.forEach((interp: any) => {
          if (interp.resultId?.bookingId?.patientId?.userId) {
            userIds.add(interp.resultId.bookingId.patientId.userId.toString());
          }
        });
        resolvedUsers = await UserModel.find({ _id: { $in: Array.from(userIds) }, isActive: true }).select('_id email phone firstName lastName');
      }
    }

    // 2. Dispatch
    const inAppOps: any[] = [];
    const io = getIO();

    // Process Registered Users
    for (const user of resolvedUsers) {
      if (payload.modes.includes('IN_APP')) {
        inAppOps.push({
          insertOne: {
            document: {
              recipientId: user._id,
              title: payload.title,
              message: payload.message,
              type: payload.type || 'BROADCAST',
            }
          }
        });
      }

      if (payload.modes.includes('EMAIL') && user.email) {
        // We simulate email with a basic template
        this.sendEmail(user.email, payload.title, 'notification', { message: payload.message }).catch((e) => logger.error('Email failed', e));
      }

      if (payload.modes.includes('SMS') && user.phone) {
        this.sendSms(user.phone, payload.message).catch((e) => logger.error('SMS failed', e));
      }
    }

    // Process External Contacts (only Email & SMS applies)
    if (payload.targetAudience === 'EXTERNAL_USERS') {
      for (const ext of externalContacts) {
        if (payload.modes.includes('EMAIL') && ext.email) {
          this.sendEmail(ext.email, payload.title, 'notification', { message: payload.message, name: ext.name }).catch((e) => logger.error('Email failed', e));
        }
        if (payload.modes.includes('SMS') && ext.phone) {
          this.sendSms(ext.phone, payload.message).catch((e) => logger.error('SMS failed', e));
        }
      }
    }

    // Bulk save in-app notifications
    if (inAppOps.length > 0) {
      await NotificationModel.bulkWrite(inAppOps);
      
      // Emit live socket event to the active users
      for (const user of resolvedUsers) {
        io.to(`user:${user._id.toString()}`).emit('new_notification', {
          title: payload.title,
          message: payload.message,
          type: payload.type || 'BROADCAST',
          createdAt: new Date(),
          isRead: false,
        });
      }
    }
  }

  // --- In-App Notifications Management ---
  async getNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      NotificationModel.find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      NotificationModel.countDocuments({ recipientId: userId }),
    ]);
    
    const unreadCount = await NotificationModel.countDocuments({ recipientId: userId, isRead: false });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    return NotificationModel.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId: string) {
    return NotificationModel.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async deleteNotification(userId: string, notificationId: string) {
    return NotificationModel.findOneAndDelete({ _id: notificationId, recipientId: userId });
  }
}

// Singleton
export const notificationService = new NotificationService();
