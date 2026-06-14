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

export const resultService = {
  async createResult(
    data: Partial<IResultRecord>,
    staffUserId: string,
    staffLabId: string,
    staffRole: string,
    ipAddress: string,
    userAgent: string
  ): Promise<IResultRecord> {
    const patient = await PatientModel.findById(data.patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found.');
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

    const result = new ResultRecordModel({
      ...data,
      laboratoryId: staffLabId,
      enteredById: staffUserId,
      notes: encryptedNotes,
    });

    const savedResult = await result.save();

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

    // Decrypt notes before returning
    if (resultObj.notes) {
      try {
        resultObj.notes = decrypt(resultObj.notes);
      } catch (error) {
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
    statusFilter?: string
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
    }

    const [results, total] = await Promise.all([
      ResultRecordModel.find(query).skip(skip).limit(limitNum).sort({ collectionDate: -1 }),
      ResultRecordModel.countDocuments(query),
    ]);

    // Decrypt notes
    const decryptedResults = results.map((result) => {
      const resultObj = result.toObject();
      if (resultObj.notes) {
        try {
          resultObj.notes = decrypt(resultObj.notes);
        } catch (error) {
          resultObj.notes = '[Decryption Failed]';
        }
      }
      return resultObj;
    });

    return createPaginatedResponse(decryptedResults, page, limitNum, total);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getResultById(id: string, userRole: string, userId: string, userLabId: string | null): Promise<any> {
    const result = await ResultRecordModel.findById(id).populate('patientId', 'userId').populate('enteredById', 'email firstName lastName');
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
      if (result.laboratoryId.toString() !== userLabId.toString()) {
        throw new ForbiddenError('This result belongs to a different laboratory.');
      }
    }

    const resultObj = result.toObject();
    if (resultObj.notes) {
      try {
        resultObj.notes = decrypt(resultObj.notes);
      } catch (error) {
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

    result.status = status;
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

          // In real app, we would check prefs.smsEnabled and enqueue SMS here
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
      } catch (error) {
        resultObj.notes = '[Decryption Failed]';
      }
    }

    return resultObj;
  },
};
