import { SendGridEmailService } from './email.adapter.js';
import { TermiiSmsService } from './sms.adapter.js';
import type { IEmailService, ISmsService, INotificationPayload } from './notification.interfaces.js';
import { logger } from '../../utils/logger.js';

export class NotificationService {
  private readonly emailService: IEmailService;
  private readonly smsService: ISmsService;

  constructor() {
    this.emailService = new SendGridEmailService();
    this.smsService = new TermiiSmsService();
  }

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    data: Record<string, unknown> = {},
  ): Promise<void> {
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
}

// Singleton
export const notificationService = new NotificationService();
