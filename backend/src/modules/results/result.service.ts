import { ResultRecordModel, type IResultRecord } from './result.model.js';
import { PatientModel } from '../patients/patient.model.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors/index.js';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';
import { encrypt, decrypt } from '../../utils/crypto.js';
import { AuditService } from '../audit/audit.service.js';
import { notificationService } from '../notifications/notification.service.js';
import { NotificationPreferenceModel } from '../notifications/notification-preference.model.js';
import { SubscriptionModel } from '../notifications/subscription.model.js';
import { UserModel } from '../auth/auth.model.js';
import { BookingModel } from '../bookings/booking.model.js';
import { PackageModel } from '../packages/package.model.js';
import { LaboratoryModel } from '../laboratories/laboratory.model.js';

export const resultService = {
  async createResult(
    data: Partial<IResultRecord>,
    staffUserId: string,
    staffLabId: string,
    staffRole: string,
    ipAddress: string,
    userAgent: string
  ): Promise<IResultRecord> {
    if (!data.referralCode) {
      throw new ValidationError('Referral code is required to upload a result.');
    }

    // 1. Fetch the booking using the referral code
    const booking = await BookingModel.findOne({ referralCode: data.referralCode });
    if (!booking) {
      throw new NotFoundError('Invalid referral code. No booking found.');
    }

    if (booking.status === 'COMPLETED') {
      throw new ValidationError('A result has already been submitted for this referral code.');
    }

    const patient = await PatientModel.findById(booking.patientId);
    if (!patient) {
      throw new NotFoundError('Patient associated with this booking not found.');
    }

    // Verify patient is linked to the staff's lab
    const isLinked = patient.laboratoryIds.some((id) => id.toString() === staffLabId.toString());
    if (!isLinked) {
      throw new ForbiddenError('Patient is not linked to your laboratory.');
    }

    let encryptedNotes: string | null = null;
    if (data.notes) {
      encryptedNotes = encrypt(data.notes);
    }

    // Get staff user name for activity log
    const staffUser = await UserModel.findById(staffUserId);
    const staffName = staffUser ? `${staffUser.firstName} ${staffUser.lastName}` : 'Unknown';

    // Determine panel type from package
    const pkg = await PackageModel.findById(booking.packageId);
    const panelType = (pkg && Array.isArray(pkg.testsIncluded) && pkg.testsIncluded.length > 1) ? 'PROFILE' : 'TEST';

    // Determine test status based on biomarker entries
    let testStatus: 'PENDING' | 'PARTIAL' | 'COMPLETE' = 'PENDING';
    if (data.biomarkers && data.biomarkers.length > 0) {
      const entered = data.biomarkers.filter(b => b.value !== undefined && b.value !== null);
      if (entered.length === data.biomarkers.length) {
        testStatus = 'COMPLETE';
      } else if (entered.length > 0) {
        testStatus = 'PARTIAL';
      }
    }

    const result = new ResultRecordModel({
      ...data,
      bookingId: booking._id,
      patientId: booking.patientId,
      laboratoryId: staffLabId,
      enteredById: staffUserId,
      orderedById: booking.orderedBy || null,
      orderedFrom: booking.orderedFrom || data.orderedFrom || null,
      panelType: data.panelType || panelType,
      testStatus: data.testStatus || testStatus,
      notes: encryptedNotes,
      activityLog: [{
        action: 'RESULT_CREATED',
        userId: staffUserId,
        userName: staffName,
        timestamp: new Date(),
        details: `Result record created for ${data.panelName || 'Unknown Panel'}`,
      }],
    });

    const savedResult = await result.save();

    // Automate System Flow: Update booking to COMPLETED
    booking.status = 'COMPLETED';
    await booking.save();

    await AuditService.log({
      actorId: staffUserId,
      actorRole: staffRole,
      action: 'RESULT_CREATED',
      resourceType: 'ResultRecord',
      resourceId: savedResult.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      newState: { status: savedResult.status, panelName: savedResult.panelName },
    });

    const resultObj = savedResult.toObject();

    // Check for critical/abnormal results and alert admins
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasCriticalParameter = ((data as any).parameters || []).some((p: any) => p.isAbnormal === true);
      
      if (hasCriticalParameter) {
        // Find all admins
        const admins = await UserModel.find({ role: 'ADMIN', isActive: true });
        const lab = await LaboratoryModel.findById(staffLabId);
        
        // Notify all admins
        const adminEmails = admins.map(admin => admin.email).filter(Boolean);
        if (adminEmails.length > 0 && patient) {
          const patientUser = await UserModel.findById(patient.userId);
          if (patientUser) {
            // Send individual emails so we can personalize with admin name
            for (const admin of admins) {
              await notificationService.sendEmail(
                admin.email,
                `URGENT: Critical Result - ${patientUser.firstName} ${patientUser.lastName}`,
                'criticalResultAlert',
                {
                  adminName: admin.firstName,
                  patientName: `${patientUser.firstName} ${patientUser.lastName}`,
                  labName: lab?.name || 'Unknown Lab',
                  packageName: pkg?.name || savedResult.panelName,
                  resultId: savedResult._id.toString(),
                }
              );
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to process critical result alerts', e);
    }

    // Decrypt notes before returning
    if (resultObj.notes) {
      try {
        resultObj.notes = decrypt(resultObj.notes);
      } catch {
        resultObj.notes = '[Decryption Failed]';
      }
    }

    return resultObj as IResultRecord;
  },

  async getResults(
    page: number,
    limit: number,
    userRole: string,
    userId: string,
    userLabId: string | null,
    patientIdFilter?: string,
    statusFilter?: string,
    testStatusFilter?: string,
    referralCodeFilter?: string
  ) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (userRole === 'PATIENT') {
      // Patients can only see their own final results
      const patient = await PatientModel.findOne({ userId });
      if (!patient) {
        throw new NotFoundError('Patient profile not found.');
      }
      query.patientId = patient._id;
      query.status = 'FINAL';
    } else {
      // Staff members
      if (userLabId) {
        query.laboratoryId = userLabId;
      }
      if (patientIdFilter) {
        query.patientId = patientIdFilter;
      }
      if (statusFilter) {
        query.status = statusFilter;
      }
      if (testStatusFilter) {
        query.testStatus = testStatusFilter;
      }
      if (referralCodeFilter) {
        query.referralCode = { $regex: referralCodeFilter, $options: 'i' };
      }
    }

    const [results, total] = await Promise.all([
      ResultRecordModel.find(query)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'firstName lastName email' }
        })
        .populate('enteredById', 'firstName lastName email')
        .populate('orderedById', 'firstName lastName email')
        .populate('sampleApprovedById', 'firstName lastName email')
        .populate('signedById', 'firstName lastName email')
        .populate('laboratoryId', 'name code')
        .skip(skip).limit(limitNum).sort({ collectionDate: -1 }),
      ResultRecordModel.countDocuments(query),
    ]);

    // Decrypt notes
    const decryptedResults = results.map((result) => {
      const resultObj = result.toObject();
      if (resultObj.notes) {
        try {
          resultObj.notes = decrypt(resultObj.notes);
        } catch {
          resultObj.notes = '[Decryption Failed]';
        }
      }
      return resultObj;
    });

    return createPaginatedResponse(decryptedResults, page, limitNum, total);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getResultById(id: string, userRole: string, userId: string, userLabId: string | null): Promise<any> {
    const result = await ResultRecordModel.findById(id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .populate('enteredById', 'firstName lastName email')
      .populate('orderedById', 'firstName lastName email')
      .populate('sampleApprovedById', 'firstName lastName email')
      .populate('signedById', 'firstName lastName email')
      .populate('laboratoryId', 'name code')
      .populate('bookingId', 'referralCode scheduledAt locationType orderedBy orderedFrom');

    if (!result) {
      throw new NotFoundError('Result not found.');
    }

    if (userRole === 'PATIENT') {
      const patient = await PatientModel.findOne({ userId });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!patient || (result.patientId as any)._id.toString() !== patient._id.toString()) {
        throw new ForbiddenError('You do not have access to this result.');
      }
      if (result.status !== 'FINAL') {
        throw new ForbiddenError('This result is not yet finalized.');
      }
    } else if (userLabId) {
      if (result.laboratoryId._id.toString() !== userLabId.toString()) {
        throw new ForbiddenError('This result belongs to a different laboratory.');
      }
    }

    const resultObj = result.toObject();
    if (resultObj.notes) {
      try {
        resultObj.notes = decrypt(resultObj.notes);
      } catch {
        resultObj.notes = '[Decryption Failed]';
      }
    }

    return resultObj;
  },

  /**
   * Update a result record (biomarkers, findings, notes, testStatus)
   */
  async updateResult(
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    staffUserId: string,
    staffLabId: string,
    staffRole: string,
    ipAddress: string,
    userAgent: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const result = await ResultRecordModel.findById(id);
    if (!result) {
      throw new NotFoundError('Result not found.');
    }

    if (result.laboratoryId.toString() !== staffLabId.toString()) {
      throw new ForbiddenError('This result belongs to a different laboratory.');
    }

    const staffUser = await UserModel.findById(staffUserId);
    const staffName = staffUser ? `${staffUser.firstName} ${staffUser.lastName}` : 'Unknown';

    // Update allowed fields
    if (data.biomarkers) {
      result.biomarkers = data.biomarkers;
      
      // Auto-compute testStatus
      const entered = data.biomarkers.filter((b: any) => b.value !== undefined && b.value !== null && b.value !== 0);
      if (entered.length === data.biomarkers.length) {
        result.testStatus = 'COMPLETE';
      } else if (entered.length > 0) {
        result.testStatus = 'PARTIAL';
      } else {
        result.testStatus = 'PENDING';
      }
    }

    if (data.testStatus) {
      result.testStatus = data.testStatus;
    }

    if (data.laboratoryFindings !== undefined) {
      result.laboratoryFindings = data.laboratoryFindings;
    }

    if (data.notes !== undefined) {
      result.notes = data.notes ? encrypt(data.notes) : null;
    }

    if (data.sampleApprovedById !== undefined) {
      result.sampleApprovedById = data.sampleApprovedById;
      result.sampleApprovedTime = data.sampleApprovedTime ? new Date(data.sampleApprovedTime) : new Date();
    }

    // Add activity log entry
    result.activityLog.push({
      action: 'RESULT_UPDATED',
      userId: staffUserId as any,
      userName: staffName,
      timestamp: new Date(),
      details: 'Result values updated',
    });

    const savedResult = await result.save();

    await AuditService.log({
      actorId: staffUserId,
      actorRole: staffRole,
      action: 'RESULT_UPDATED',
      resourceType: 'ResultRecord',
      resourceId: savedResult.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      newState: { testStatus: savedResult.testStatus },
    });

    const resultObj = savedResult.toObject();
    if (resultObj.notes) {
      try {
        resultObj.notes = decrypt(resultObj.notes);
      } catch {
        resultObj.notes = '[Decryption Failed]';
      }
    }

    return resultObj;
  },

  /**
   * Submit result for approval — sets status to FINAL and marks as signed
   */
  async submitForApproval(
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    staffUserId: string,
    staffLabId: string,
    staffRole: string,
    ipAddress: string,
    userAgent: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const result = await ResultRecordModel.findById(id);
    if (!result) {
      throw new NotFoundError('Result not found.');
    }

    if (result.laboratoryId.toString() !== staffLabId.toString()) {
      throw new ForbiddenError('This result belongs to a different laboratory.');
    }

    if (result.status === 'FINAL') {
      throw new ValidationError('Result has already been submitted for approval.');
    }

    const staffUser = await UserModel.findById(staffUserId);
    const staffName = staffUser ? `${staffUser.firstName} ${staffUser.lastName}` : 'Unknown';

    // Update biomarkers if provided in the submission
    if (data.biomarkers) {
      result.biomarkers = data.biomarkers;
    }

    if (data.laboratoryFindings !== undefined) {
      result.laboratoryFindings = data.laboratoryFindings;
    }

    // Mark as submitted
    result.status = 'FINAL';
    result.testStatus = 'COMPLETE';
    result.signed = true;
    result.signedById = staffUserId as any;
    result.signedAt = new Date();

    // Activity log
    result.activityLog.push({
      action: 'SUBMITTED_FOR_APPROVAL',
      userId: staffUserId as any,
      userName: staffName,
      timestamp: new Date(),
      details: 'Result submitted for approval',
    });

    const savedResult = await result.save();

    await AuditService.log({
      actorId: staffUserId,
      actorRole: staffRole,
      action: 'RESULT_SUBMITTED_FOR_APPROVAL',
      resourceType: 'ResultRecord',
      resourceId: savedResult.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      newState: { status: 'FINAL', signed: true },
    });

    // Notify patient
    try {
      const patient = await PatientModel.findById(savedResult.patientId);
      if (patient) {
        const patientUser = await UserModel.findById(patient.userId);
        if (patientUser) {
          let prefs = await NotificationPreferenceModel.findOne({ userId: patient.userId });
          if (!prefs) {
            prefs = { emailEnabled: true, smsEnabled: false } as any;
          }

          if (prefs!.emailEnabled) {
            await notificationService.sendEmail(
              patientUser.email,
              'Your Test Results are Ready',
              'result_ready',
              { firstName: patientUser.firstName, panelName: savedResult.panelName }
            );
          }
        }

        // Notify subscribers
        const subscriptions = await SubscriptionModel.find({ patientId: patient._id, eventTypes: 'RESULT_FINALIZED' }).populate('subscriberId');
        for (const sub of subscriptions) {
          const subscriber = sub.subscriberId as any;
          if (subscriber && subscriber.email) {
            await notificationService.sendEmail(
              subscriber.email,
              'New Test Result Finalized',
              'result_finalized',
              { firstName: subscriber.firstName, panelName: savedResult.panelName }
            );
          }
        }
      }
    } catch (e) {
      console.error('Failed to send result notification', e);
    }

    const resultObj = savedResult.toObject();
    if (resultObj.notes) {
      try {
        resultObj.notes = decrypt(resultObj.notes);
      } catch {
        resultObj.notes = '[Decryption Failed]';
      }
    }

    return resultObj;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateStatus(
    id: string,
    status: 'DRAFT' | 'FINAL' | 'AMENDED' | 'CANCELLED',
    staffUserId: string,
    staffLabId: string,
    staffRole: string,
    ipAddress: string,
    userAgent: string
  ): Promise<any> {
    const result = await ResultRecordModel.findById(id);
    if (!result) {
      throw new NotFoundError('Result not found.');
    }

    if (result.laboratoryId.toString() !== staffLabId.toString()) {
      throw new ForbiddenError('This result belongs to a different laboratory.');
    }

    const previousStatus = result.status;
    
    if (previousStatus === status) {
      throw new ValidationError(`Result is already in ${status} status.`);
    }

    const staffUser = await UserModel.findById(staffUserId);
    const staffName = staffUser ? `${staffUser.firstName} ${staffUser.lastName}` : 'Unknown';

    result.status = status;

    // If finalizing, mark as signed
    if (status === 'FINAL' && !result.signed) {
      result.signed = true;
      result.signedById = staffUserId as any;
      result.signedAt = new Date();
    }

    // Add activity log
    result.activityLog.push({
      action: 'STATUS_UPDATED',
      userId: staffUserId as any,
      userName: staffName,
      timestamp: new Date(),
      details: `Status changed from ${previousStatus} to ${status}`,
    });

    const savedResult = await result.save();

    await AuditService.log({
      actorId: staffUserId,
      actorRole: staffRole,
      action: 'RESULT_STATUS_UPDATED',
      resourceType: 'ResultRecord',
      resourceId: savedResult.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      previousState: { status: previousStatus },
      newState: { status: savedResult.status },
    });

    if (previousStatus !== 'FINAL' && status === 'FINAL') {
      const patient = await PatientModel.findById(savedResult.patientId);
      if (patient) {
        const patientUser = await UserModel.findById(patient.userId);
        if (patientUser) {
          let prefs = await NotificationPreferenceModel.findOne({ userId: patient.userId });
          if (!prefs) {
            prefs = { emailEnabled: true, smsEnabled: false } as any;
          }

          if (prefs!.emailEnabled) {
            await notificationService.sendEmail(
              patientUser.email,
              'Your Test Results are Ready',
              'result_ready',
              { firstName: patientUser.firstName, panelName: savedResult.panelName }
            );
          }
        }

        // Notify subscribers
        const subscriptions = await SubscriptionModel.find({ patientId: patient._id, eventTypes: 'RESULT_FINALIZED' }).populate('subscriberId');
        for (const sub of subscriptions) {
          const subscriber = sub.subscriberId as any;
          if (subscriber && subscriber.email) {
            await notificationService.sendEmail(
              subscriber.email,
              'New Test Result Finalized',
              'result_finalized',
              { firstName: subscriber.firstName, panelName: savedResult.panelName }
            );
          }
        }
      }
    }

    const resultObj = savedResult.toObject();
    if (resultObj.notes) {
      try {
        resultObj.notes = decrypt(resultObj.notes);
      } catch {
        resultObj.notes = '[Decryption Failed]';
      }
    }

    return resultObj;
  },
};
