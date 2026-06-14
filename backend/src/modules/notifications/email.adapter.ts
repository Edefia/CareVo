import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import type { IEmailService } from './notification.interfaces.js';

const resend = new Resend(env.RESEND_API_KEY);

export class ResendEmailService implements IEmailService {
  async send(
    to: string,
    subject: string,
    template: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    try {
      const { error } = await resend.emails.send({
        to: [to],
        from: env.EMAIL_FROM,
        subject,
        html: this.renderTemplate(template, data),
      });

      if (error) {
        throw new Error(error.message);
      }
      
      logger.info('Email sent successfully via Resend', { to, subject });
    } catch (error) {
      logger.error('Failed to send email via Resend', {
        to,
        subject,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  private renderTemplate(template: string, data: Record<string, unknown>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(data)) {
      rendered = rendered.replaceAll(`{{${key}}}`, String(value));
    }
    return rendered;
  }
}
