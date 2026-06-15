// @ts-nocheck
import { InvoiceModel } from './invoice.model.js';
import { PatientModel } from '../patients/patient.model.js';
import { UserModel } from '../auth/auth.model.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors/index.js';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';
import { AuditService } from '../audit/audit.service.js';
import { notificationService } from '../notifications/notification.service.js';
import { NotificationPreferenceModel } from '../notifications/notification-preference.model.js';
import { paymentService } from './payment.service.js';

export const billingService = {
  async initiateMoolrePayment(invoiceId: string, customerPhone: string, channel: string, userId: string, userRole: string, ipAddress: string, userAgent: string) {
    const invoice = await InvoiceModel.findById(invoiceId).populate('patientId');
    if (!invoice) throw new NotFoundError('Invoice not found.');
    if (invoice.status === 'PAID') throw new ValidationError('Invoice is already paid.');

    const patient = await PatientModel.findById(invoice.patientId);
    if (!patient) throw new NotFoundError('Patient not found.');
    const user = await UserModel.findById(patient.userId);
    if (!user) throw new NotFoundError('Patient user not found.');

    const customerName = `${user.firstName} ${user.lastName}`;

    const paymentResponse = await paymentService.initiatePayment(
      invoice.amount,
      invoice.currency,
      invoice.id,
      customerPhone,
      customerName,
      channel
    );

    await AuditService.log({
      actorId: userId,
      actorRole: userRole,
      action: 'PAYMENT_INITIATED',
      resourceType: 'Invoice',
      resourceId: invoice.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      newState: { status: invoice.status, gateway: 'Moolre' },
    });

    return paymentResponse;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createInvoice(data: any, creatorId: string, creatorRole: string, ipAddress: string, userAgent: string) {
    const patient = await PatientModel.findById(data.patientId);
    if (!patient) throw new NotFoundError('Patient not found.');

    const invoice = new InvoiceModel({
      patientId: data.patientId,
      issuedBy: creatorId,
      amount: data.amount,
      currency: data.currency || 'USD',
      status: 'PENDING',
      description: data.description,
    });

    const saved = await invoice.save();

    await AuditService.log({
      actorId: creatorId,
      actorRole: creatorRole,
      action: 'INVOICE_CREATED',
      resourceType: 'Invoice',
      resourceId: saved.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      newState: { amount: saved.amount, status: saved.status },
    });

    return saved;
  },

  async getInvoices(page: number, limit: number, userRole: string, userId: string, patientIdFilter?: string, statusFilter?: string) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (userRole === 'PATIENT') {
      const patient = await PatientModel.findOne({ userId });
      if (!patient) throw new NotFoundError('Patient profile not found.');
      query.patientId = patient._id;
    } else if (patientIdFilter) {
      query.patientId = patientIdFilter;
    }

    if (statusFilter) query.status = statusFilter;

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      InvoiceModel.countDocuments(query),
    ]);

    return createPaginatedResponse(invoices, page, limitNum, total);
  },

  async getInvoiceById(id: string, userRole: string, userId: string) {
    const invoice = await InvoiceModel.findById(id).populate('issuedBy', 'firstName lastName role').populate('patientId', 'userId');
    if (!invoice) throw new NotFoundError('Invoice not found.');

    if (userRole === 'PATIENT') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const patientUserId = (invoice.patientId as any).userId.toString();
      if (patientUserId !== userId) {
        throw new ForbiddenError('Access denied.');
      }
    }

    return invoice;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateInvoiceStatus(id: string, data: any, userId: string, userRole: string, ipAddress: string, userAgent: string) {
    const invoice = await InvoiceModel.findById(id);
    if (!invoice) throw new NotFoundError('Invoice not found.');

    const oldStatus = invoice.status;
    invoice.status = data.status;

    if (data.status === 'PAID') {
      invoice.paidAt = new Date();
    } else if (data.status === 'PENDING') {
      invoice.paidAt = null;
    }

    if (data.referenceId !== undefined) invoice.referenceId = data.referenceId;
    if (data.paymentGateway !== undefined) invoice.paymentGateway = data.paymentGateway;

    await invoice.save();

    await AuditService.log({
      actorId: userId,
      actorRole: userRole,
      action: 'INVOICE_STATUS_UPDATED',
      resourceType: 'Invoice',
      resourceId: invoice.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      previousState: { status: oldStatus },
      newState: { status: invoice.status, gateway: invoice.paymentGateway },
    });

    // Notify patient if PAID
    if (invoice.status === 'PAID' && oldStatus !== 'PAID') {
      const patient = await PatientModel.findById(invoice.patientId);
      if (patient) {
        const patientUser = await UserModel.findById(patient.userId);
        if (patientUser) {
          const prefs = await NotificationPreferenceModel.findOne({ userId: patientUser._id });
          if (!prefs || prefs.emailEnabled) {
            const displayAmount = (invoice.amount / 100).toFixed(2);
            await notificationService.add('sendEmail', {
              to: patientUser.email,
              subject: 'Payment Receipt',
              body: `Hello ${patientUser.firstName},<br><br>We have successfully received your payment of ${invoice.currency} ${displayAmount} for "${invoice.description}".<br><br>Thank you for using CareVo Health.`,
            });
          }
        }
      }
    }

    return this.getInvoiceById(id, userRole, userId);
  }
};
