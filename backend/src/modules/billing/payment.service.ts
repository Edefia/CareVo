import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import axios from 'axios';

export class PaymentService {
  private readonly baseUrl = 'https://api.moolre.com/open/payments';
  private readonly apiUser: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUser = env.MOOLRE_API_USER;
    this.apiKey = env.MOOLRE_API_KEY;
  }

  async initiatePayment(
    amount: number,
    currency: string,
    referenceId: string,
    customerPhone: string,
    customerName: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/initiate`,
        {
          amount,
          currency,
          reference: referenceId,
          customer_phone: customerPhone,
          customer_name: customerName,
        },
        {
          headers: {
            'X-API-USER': this.apiUser,
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Payment initiated successfully via Moolre', { referenceId, amount });
      return response.data;
    } catch (error) {
      logger.error('Failed to initiate payment via Moolre', {
        referenceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async verifyPayment(referenceId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/verify/${referenceId}`, {
        headers: {
          'X-API-USER': this.apiUser,
          'X-API-KEY': this.apiKey,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to verify payment via Moolre', {
        referenceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
