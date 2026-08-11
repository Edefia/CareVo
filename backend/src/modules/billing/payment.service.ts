import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import axios from 'axios';

export class PaymentService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor() {
    this.secretKey = env.PAYSTACK_SECRET_KEY;
  }

  /**
   * Initialize a Paystack transaction.
   * Returns an authorization_url (redirect) and access_code (inline popup).
   */
  async initializeTransaction(
    amount: number,        // in pesewas (smallest unit)
    email: string,
    reference: string,
    metadata: Record<string, unknown> = {},
    callbackUrl?: string
  ): Promise<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount,            // Paystack expects amount in pesewas for GHS
          email,
          reference,
          currency: 'GHS',
          callback_url: callbackUrl || `${env.FRONTEND_URL}/client/billing`,
          metadata: {
            ...metadata,
            custom_fields: [
              {
                display_name: 'Platform',
                variable_name: 'platform',
                value: 'CareVo Health',
              },
            ],
          },
          channels: ['card', 'bank', 'mobile_money', 'qr', 'ussd'],
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data?.status) {
        throw new Error(response.data?.message || 'Paystack initialization failed');
      }

      logger.info('Paystack transaction initialized', { reference, amount, email });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to initialize Paystack transaction', {
        reference,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Verify a Paystack transaction by reference.
   */
  async verifyTransaction(reference: string): Promise<{
    status: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    gateway_response: string;
    reference: string;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      if (!response.data?.status) {
        throw new Error(response.data?.message || 'Paystack verification failed');
      }

      logger.info('Paystack transaction verified', {
        reference,
        transactionStatus: response.data.data.status,
      });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to verify Paystack transaction', {
        reference,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Validate a Paystack webhook signature.
   * Paystack signs webhooks with HMAC SHA-512 using your secret key.
   */
  validateWebhookSignature(body: string, signature: string): boolean {
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(body)
      .digest('hex');
    return hash === signature;
  }
}

export const paymentService = new PaymentService();
