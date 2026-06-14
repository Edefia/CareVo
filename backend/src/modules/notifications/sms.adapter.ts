import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import type { ISmsService } from './notification.interfaces.js';

export class MoolreSmsService implements ISmsService {
  private readonly vasKey: string;
  private readonly baseUrl = 'https://api.moolre.com/open/sms/send';

  constructor() {
    this.vasKey = env.MOOLRE_VASKEY;
  }

  async send(to: string, message: string): Promise<void> {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append('type', '1');
      url.searchParams.append('senderid', 'CareVo');
      url.searchParams.append('recipient', to);
      url.searchParams.append('message', message);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-API-VASKEY': this.vasKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Moolre API error: ${response.status} ${response.statusText}`);
      }

      logger.info('SMS sent successfully via Moolre', { to });
    } catch (error) {
      logger.error('Failed to send SMS via Moolre', {
        to,
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
