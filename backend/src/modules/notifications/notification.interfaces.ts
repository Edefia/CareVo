export interface IEmailService {
  send(
    to: string,
    subject: string,
    template: string,
    data: Record<string, unknown>,
  ): Promise<void>;
}

export interface ISmsService {
  send(to: string, message: string): Promise<void>;
}

export interface INotificationPayload {
  type: 'email' | 'sms';
  to: string;
  subject?: string;
  template?: string;
  message?: string;
  data?: Record<string, unknown>;
}
