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
      currency: data.currency || 'GHS',
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

    if (userRole === 'PATIENT' || userRole === 'CLIENT') {
      const patient = await PatientModel.findOne({ userId });
      if (!patient) throw new NotFoundError('Patient profile not found.');
      query.patientId = patient._id;
    } else if (patientIdFilter) {
      query.patientId = patientIdFilter;
    }

    if (statusFilter) query.status = statusFilter;

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(query)
        .populate({
          path: 'patientId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email phone',
          },
        })
        .populate('issuedBy', 'firstName lastName role')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      InvoiceModel.countDocuments(query),
    ]);

    return createPaginatedResponse(invoices, page, limitNum, total);
  },

  async getInvoiceById(id: string, userRole: string, userId: string) {
    const invoice = await InvoiceModel.findById(id)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone',
        },
      })
      .populate('issuedBy', 'firstName lastName role');
    if (!invoice) throw new NotFoundError('Invoice not found.');

    if (userRole === 'PATIENT' || userRole === 'CLIENT') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const patientUserId = (invoice.patientId as any)?.userId?._id?.toString() || (invoice.patientId as any)?.userId?.toString();
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
              body: `Hello ${patientUser.firstName},<br><br>We have successfully received your payment of ${invoice.currency} ${displayAmount} for "${invoice.description}".<br><br>Thank you for using CareBis Prime Health.`,
            });
          }
        }
      }
    }

    return this.getInvoiceById(id, userRole, userId);
  },

  // ===================== NEW ADMIN METHODS =====================

  async getBillingStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      monthlyRevenueResult,
      pendingResult,
      overdueCount,
      totalPaidResult,
      totalInvoices,
    ] = await Promise.all([
      InvoiceModel.aggregate([
        { $match: { status: 'PAID', paidAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      InvoiceModel.aggregate([
        { $match: { status: 'PENDING' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      // Overdue = PENDING and created more than 30 days ago
      InvoiceModel.countDocuments({
        status: 'PENDING',
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      InvoiceModel.aggregate([
        { $match: { status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      InvoiceModel.countDocuments(),
    ]);

    return {
      monthlyRevenue: (monthlyRevenueResult[0]?.total || 0) / 100,
      pendingAmount: (pendingResult[0]?.total || 0) / 100,
      pendingCount: pendingResult[0]?.count || 0,
      overdueCount,
      totalRevenue: (totalPaidResult[0]?.total || 0) / 100,
      totalInvoices,
    };
  },

  async verifyPaymentStatus(invoiceId: string, userId: string, userRole: string, ipAddress: string, userAgent: string) {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) throw new NotFoundError('Invoice not found.');
    if (!invoice.referenceId) throw new ValidationError('No payment reference found for this invoice.');

    const verifyResult = await paymentService.verifyPayment(invoice.referenceId);

    // If payment is confirmed, update invoice status
    if (verifyResult && (verifyResult.status === 'SUCCESSFUL' || verifyResult.code === '00')) {
      invoice.status = 'PAID';
      invoice.paidAt = new Date();
      invoice.paymentGateway = 'HUBTEL'; // or extract from response
      await invoice.save();

      await AuditService.log({
        actorId: userId,
        actorRole: userRole,
        action: 'PAYMENT_VERIFIED',
        resourceType: 'Invoice',
        resourceId: invoice.id,
        ipAddress,
        userAgent,
        sessionId: 'internal',
        success: true,
        newState: { status: 'PAID', verifyResult },
      });
    }

    return { invoice, verifyResult };
  },

  async recordManualPayment(invoiceId: string, paymentMethod: string, referenceNote: string, userId: string, userRole: string, ipAddress: string, userAgent: string) {
    const invoice = await InvoiceModel.findById(invoiceId);
    if (!invoice) throw new NotFoundError('Invoice not found.');
    if (invoice.status === 'PAID') throw new ValidationError('Invoice is already paid.');

    invoice.status = 'PAID';
    invoice.paidAt = new Date();
    invoice.paymentGateway = 'MANUAL';
    invoice.referenceId = referenceNote || `MANUAL-${Date.now()}`;
    await invoice.save();

    await AuditService.log({
      actorId: userId,
      actorRole: userRole,
      action: 'MANUAL_PAYMENT_RECORDED',
      resourceType: 'Invoice',
      resourceId: invoice.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      newState: { status: 'PAID', paymentMethod, referenceNote },
    });

    return this.getInvoiceById(invoiceId, userRole, userId);
  },
};
