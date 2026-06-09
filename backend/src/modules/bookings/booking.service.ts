import { BookingModel } from './booking.model.js';
import { PatientModel } from '../patients/patient.model.js';
import { UserModel } from '../auth/auth.model.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors/index.js';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';
import { encryptSymmetric, decryptSymmetric } from '../../utils/crypto.js';
import { auditService } from '../audit/audit.service.js';
import { notificationQueue } from '../notifications/notification.service.js';
import { NotificationPreferenceModel } from '../notifications/notification-preference.model.js';

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

    const booking = new BookingModel({
      patientId: data.patientId,
      staffId: data.staffId || null,
      status: 'PENDING',
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes || 30,
      reason: data.reason,
    });

    const saved = await booking.save();

    await auditService.log({
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
    } else {
      if (patientIdFilter) query.patientId = patientIdFilter;
    }

    if (statusFilter) query.status = statusFilter;

    const [bookings, total] = await Promise.all([
      BookingModel.find(query).skip(skip).limit(limitNum).sort({ scheduledAt: 1 }),
      BookingModel.countDocuments(query),
    ]);

    const decrypted = bookings.map((b) => {
      const obj = b.toObject();
      if (userRole === 'PATIENT') {
        // Hide internal notes from patient
        delete obj.internalNotes;
      } else if (obj.internalNotes) {
        try { obj.internalNotes = decryptSymmetric(obj.internalNotes); } catch { obj.internalNotes = '[Decryption Failed]'; }
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
      delete obj.internalNotes;
    } else if (obj.internalNotes) {
      try { obj.internalNotes = decryptSymmetric(obj.internalNotes); } catch { obj.internalNotes = '[Decryption Failed]'; }
    }

    return obj;
  },

  async updateBookingStatus(id: string, status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED', meetingLink: string | undefined, userId: string, userRole: string, ipAddress: string, userAgent: string) {
    const booking = await BookingModel.findById(id);
    if (!booking) throw new NotFoundError('Booking not found.');

    const oldStatus = booking.status;
    booking.status = status;
    if (meetingLink !== undefined) {
      booking.meetingLink = meetingLink;
    }

    await booking.save();

    await auditService.log({
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

    // Notify patient
    if (status === 'CONFIRMED' || status === 'CANCELLED') {
      const patient = await PatientModel.findById(booking.patientId);
      if (patient) {
        const patientUser = await UserModel.findById(patient.userId);
        if (patientUser) {
          const prefs = await NotificationPreferenceModel.findOne({ userId: patientUser._id });
          if (!prefs || prefs.emailEnabled) {
            let body = '';
            if (status === 'CONFIRMED') {
              body = `Hello ${patientUser.firstName},<br><br>Your appointment scheduled for ${booking.scheduledAt.toLocaleString()} has been confirmed.`;
              if (booking.meetingLink) {
                body += `<br><br>Meeting Link: <a href="${booking.meetingLink}">${booking.meetingLink}</a>`;
              }
            } else if (status === 'CANCELLED') {
              body = `Hello ${patientUser.firstName},<br><br>Your appointment scheduled for ${booking.scheduledAt.toLocaleString()} has been cancelled. Please contact us to reschedule.`;
            }
            await notificationQueue.add('sendEmail', {
              to: patientUser.email,
              subject: `Appointment ${status === 'CONFIRMED' ? 'Confirmed' : 'Cancelled'}`,
              body,
            });
          }
        }
      }
    }

    return this.getBookingById(id, userRole, userId);
  },

  async updateInternalNotes(id: string, internalNotes: string | null, userId: string, userRole: string, ipAddress: string, userAgent: string) {
    const booking = await BookingModel.findById(id);
    if (!booking) throw new NotFoundError('Booking not found.');

    if (internalNotes) {
      booking.internalNotes = encryptSymmetric(internalNotes);
    } else {
      booking.internalNotes = null;
    }

    await booking.save();

    await auditService.log({
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
