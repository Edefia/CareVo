import sgMail from '@sendgrid/mail';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import type { IEmailService } from './notification.interfaces.js';

sgMail.setApiKey(env.SENDGRID_API_KEY);

export class SendGridEmailService implements IEmailService {
  async send(
    to: string,
    subject: string,
    template: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      await sgMail.send({
        to,
        from: env.EMAIL_FROM,
        subject,
        html: this.renderTemplate(template, data),
      });
      logger.info('Email sent successfully', { to, subject });
    } catch (error) {
      logger.error('Failed to send email', {
        to,
        subject,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  private renderTemplate(template: string, data: Record<string, unknown>): string {
    // Simple template rendering — replace {{key}} with values
    let rendered = template;
    for (const [key, value] of Object.entries(data)) {
      rendered = rendered.replaceAll(`{{${key}}}`, String(value));
    }
    return rendered;
  }
}
