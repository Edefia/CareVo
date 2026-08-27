import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { emailTemplates, type EmailTemplateKey } from '../../utils/emailTemplates.js';
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
      // Use the template engine if a matching template function exists
      let html: string;
      if (template in emailTemplates) {
        const templateFn = emailTemplates[template as EmailTemplateKey];
        html = (templateFn as (data: any) => string)(data);
      } else {
        // Fallback: use the generic notification template
        html = emailTemplates.notification({ message: data.message as string, name: data.name as string });
      }

      const { error } = await resend.emails.send({
        to: [to],
        from: env.EMAIL_FROM,
        subject,
        html,
      });

      if (error) {
        throw new Error(error.message);
      }
      
      logger.info('Email sent successfully via Resend', { to, subject, template });
    } catch (error) {
      logger.error('Failed to send email via Resend', {
        to,
        subject,
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
