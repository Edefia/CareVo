import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import type { ISmsService } from './notification.interfaces.js';

export class TermiiSmsService implements ISmsService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.ng.termii.com/api/sms/send';

  constructor() {
    this.apiKey = env.TERMII_API_KEY;
  }

  async send(to: string, message: string): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          from: 'CareVo',
          sms: message,
          type: 'plain',
          channel: 'generic',
          api_key: this.apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Termii API error: ${response.status} ${response.statusText}`);
      }

      logger.info('SMS sent successfully', { to });
    } catch (error) {
      logger.error('Failed to send SMS', {
        to,
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
