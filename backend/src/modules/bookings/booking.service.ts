import { BookingModel } from './booking.model.js';
import { PatientModel } from '../patients/patient.model.js';
import { UserModel } from '../auth/auth.model.js';
import { PackageModel } from '../packages/package.model.js';
import { InvoiceModel } from '../billing/invoice.model.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors/index.js';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';
import { encrypt, decrypt } from '../../utils/crypto.js';
import { AuditService } from '../audit/audit.service.js';
import { notificationService } from '../notifications/notification.service.js';
import { LaboratoryModel } from '../laboratories/laboratory.model.js';
import { LabServiceModel } from '../laboratories/lab-service.model.js';

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CRV-${new Date().getFullYear()}-${result}`;
}

export const bookingService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createBooking(data: any, creatorId: string, creatorRole: string, ipAddress: string, userAgent: string) {
    const patient = await PatientModel.findById(data.patientId);
    if (!patient) throw new NotFoundError('Patient not found.');

    if (creatorRole === 'PATIENT' && patient.userId.toString() !== creatorId) {
      throw new ForbiddenError('Patients can only book appointments for themselves.');
    }

    if (data.staffId) {
      const staff = await UserModel.findById(data.staffId);
      if (!staff) throw new NotFoundError('Staff not found.');
    }

    if (data.laboratoryId) {
      const lab = await LaboratoryModel.findById(data.laboratoryId);
      if (!lab) throw new NotFoundError('Laboratory not found.');
    }

    const pkg = await PackageModel.findById(data.packageId);
    if (!pkg || !pkg.isActive) throw new NotFoundError('Package not found or inactive.');

    const referralCode = generateReferralCode();

    const booking = new BookingModel({
      patientId: data.patientId,
      packageId: pkg._id,
      locationType: data.locationType,
      referralCode: referralCode,
      staffId: data.staffId || null,
      laboratoryId: data.laboratoryId || null,
      status: 'PENDING',
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes || 30,
      reason: data.reason || 'Screening Booking',
    });

    const saved = await booking.save();

    // Automatically generate an invoice — price comes from the lab's approved service, not the global package
    let invoiceAmount = 0;
    if (data.laboratoryId) {
      const labService = await LabServiceModel.findOne({
        laboratoryId: data.laboratoryId,
        packageId: pkg._id,
        approvalStatus: 'APPROVED',
        isActive: true,
      });
      if (labService) {
        invoiceAmount = labService.platformPrice * 100; // pesewas
      }
    }

    await InvoiceModel.create({
      patientId: patient._id,
      issuedBy: creatorId,
      amount: invoiceAmount,
      currency: 'GHS',
      status: 'PENDING',
      description: `Payment for ${pkg.name} (${data.locationType === 'HOME' ? 'Home Collection' : 'In-Clinic'})`,
      referenceId: referralCode,
    });

    await AuditService.log({
      actorId: creatorId,
      actorRole: creatorRole,
      action: 'BOOKING_CREATED',
      resourceType: 'Booking',
      resourceId: saved.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
    });

    return saved;
  },

  async getBookings(page: number, limit: number, userRole: string, userId: string, patientIdFilter?: string, statusFilter?: string) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (userRole === 'PATIENT') {
      const patient = await PatientModel.findOne({ userId });
      if (!patient) throw new NotFoundError('Patient profile not found.');
      query.patientId = patient._id;
    } else if (userRole === 'LABORATORY') {
      // Lab user sees bookings for their laboratory
      const user = await UserModel.findById(userId);
      if (user && user.laboratoryId) {
        query.laboratoryId = user.laboratoryId;
      }
      if (patientIdFilter) query.patientId = patientIdFilter;
    } else {
      if (patientIdFilter) query.patientId = patientIdFilter;
    }

    if (statusFilter) query.status = statusFilter;

    const [bookings, total] = await Promise.all([
      BookingModel.find(query)
        .populate({
          path: 'patientId',
          populate: {
            path: 'userId',
            select: 'firstName lastName email phone'
          }
        })
        .populate('packageId', 'name')
        .skip(skip)
        .limit(limitNum)
        .sort({ scheduledAt: 1 }),
      BookingModel.countDocuments(query),
    ]);

    const decrypted = bookings.map((b) => {
      const obj = b.toObject();
      if (userRole === 'PATIENT') {
        delete (obj as any).internalNotes;
      } else if (obj.internalNotes) {
        try { obj.internalNotes = decrypt(obj.internalNotes); } catch { obj.internalNotes = '[Decryption Failed]'; }
      }
      return obj;
    });

    return createPaginatedResponse(decrypted, page, limitNum, total);
  },

  async getBookingById(id: string, userRole: string, userId: string) {
    const booking = await BookingModel.findById(id).populate('staffId', 'firstName lastName role').populate('patientId', 'userId');
    if (!booking) throw new NotFoundError('Booking not found.');

    if (userRole === 'PATIENT') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const patientUserId = (booking.patientId as any).userId.toString();
      if (patientUserId !== userId) {
        throw new ForbiddenError('Access denied.');
      }
    }

    const obj = booking.toObject();
    if (userRole === 'PATIENT') {
      delete (obj as any).internalNotes;
    } else if (obj.internalNotes) {
      try { obj.internalNotes = decrypt(obj.internalNotes); } catch { obj.internalNotes = '[Decryption Failed]'; }
    }

    return obj;
  },

  async updateBookingStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED', meetingLink: string | undefined, userId: string, userRole: string, ipAddress: string, userAgent: string) {
    const booking = await BookingModel.findById(id).populate('packageId');
    if (!booking) throw new NotFoundError('Booking not found.');

    const oldStatus = booking.status;
    booking.status = status;
    if (meetingLink !== undefined) {
      booking.meetingLink = meetingLink;
    }

    await booking.save();

    await AuditService.log({
      actorId: userId,
      actorRole: userRole,
      action: 'BOOKING_STATUS_UPDATED',
      resourceType: 'Booking',
      resourceId: booking.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      previousState: { status: oldStatus },
      newState: { status: booking.status },
    });

    // Handle Notifications
    try {
      const patient = await PatientModel.findById(booking.patientId).populate('userId');
      const lab = booking.laboratoryId ? await LaboratoryModel.findById(booking.laboratoryId) : null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pkg = booking.packageId as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const patientUser = patient?.userId as any;
      const actingUser = await UserModel.findById(userId);

      if (status === 'CANCELLED' && patientUser) {
        // Notify the client
        await notificationService.sendEmail(
          patientUser.email,
          `Booking Cancelled - ${pkg?.name}`,
          'bookingCancelled',
          {
            recipientName: patientUser.firstName,
            bookingId: booking._id.toString().slice(-6).toUpperCase(),
            packageName: pkg?.name || 'Service',
            date: booking.scheduledAt.toLocaleString(),
            canceledBy: actingUser ? actingUser.firstName : 'Admin',
            reason: 'Booking was cancelled. Please reschedule if needed.',
          }
        );

        // Notify the lab if it was cancelled by someone other than the lab
        if (lab && lab.contactEmail && userRole !== 'LABORATORY') {
           await notificationService.sendEmail(
             lab.contactEmail,
             `Booking Cancelled - #${booking._id.toString().slice(-6).toUpperCase()}`,
             'bookingCancelled',
             {
               recipientName: lab.name,
               bookingId: booking._id.toString().slice(-6).toUpperCase(),
               packageName: pkg?.name || 'Service',
               date: booking.scheduledAt.toLocaleString(),
               canceledBy: actingUser ? actingUser.firstName : 'Client',
               reason: 'The client cancelled this appointment.',
             }
           );
        }
      } else if (status === 'COMPLETED' && patientUser && lab) {
        // Request feedback from client
        await notificationService.sendEmail(
          patientUser.email,
          `How was your screening at ${lab.name}?`,
          'feedbackRequest',
          {
            clientName: patientUser.firstName,
            labName: lab.name,
            packageName: pkg?.name || 'Service',
          }
        );
      }
    } catch (e) {
      // Non-blocking notification error
      console.error('Failed to send booking status notification:', e);
    }

    return this.getBookingById(id, userRole, userId);
  },

  async updateInternalNotes(id: string, internalNotes: string | null, userId: string, userRole: string, ipAddress: string, userAgent: string) {
    const booking = await BookingModel.findById(id);
    if (!booking) throw new NotFoundError('Booking not found.');

    if (internalNotes) {
      booking.internalNotes = encrypt(internalNotes);
    } else {
      booking.internalNotes = null;
    }

    await booking.save();

    await AuditService.log({
      actorId: userId,
      actorRole: userRole,
      action: 'BOOKING_NOTES_UPDATED',
      resourceType: 'Booking',
      resourceId: booking.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
    });

    return this.getBookingById(id, userRole, userId);
  }
};
