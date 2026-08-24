import { InterpretationModel } from './interpretation.model.js';
import { ResultRecordModel } from '../results/result.model.js';
import { PatientModel } from '../patients/patient.model.js';
import { UserModel } from '../auth/auth.model.js';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../../shared/errors/index.js';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';
import { encrypt, decrypt } from '../../utils/crypto.js';
import { AuditService } from '../audit/audit.service.js';
import { notificationService } from '../notifications/notification.service.js';
import { NotificationPreferenceModel } from '../notifications/notification-preference.model.js';

export const interpretationService = {
  async createInterpretation(
    data: { resultId: string; summary: string; clinicalNotes?: string | null; recommendations?: string | null },
    interpreterUserId: string,
    interpreterRole: string,
    ipAddress: string,
    userAgent: string
  ) {
    const result = await ResultRecordModel.findById(data.resultId);
    if (!result) {
      throw new NotFoundError('Result record not found.');
    }
    
    // Check if result already has an interpretation
    const existing = await InterpretationModel.findOne({ resultId: data.resultId });
    if (existing) {
      throw new ConflictError('An interpretation already exists for this result.');
    }

    const patient = await PatientModel.findById(result.patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found.');
    }

    let encryptedNotes: string | null = null;
    let encryptedRecs: string | null = null;

    if (data.clinicalNotes) {
      encryptedNotes = encrypt(data.clinicalNotes);
    }
    if (data.recommendations) {
      encryptedRecs = encrypt(data.recommendations);
    }

    const interpretation = new InterpretationModel({
      resultId: data.resultId,
      patientId: patient._id,
      interpreterId: interpreterUserId,
      status: 'DRAFT',
      summary: data.summary,
      clinicalNotes: encryptedNotes,
      recommendations: encryptedRecs,
    });

    const saved = await interpretation.save();

    await AuditService.log({
      actorId: interpreterUserId,
      actorRole: interpreterRole,
      action: 'INTERPRETATION_CREATED',
      resourceType: 'Interpretation',
      resourceId: saved.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
      newState: { status: saved.status, resultId: saved.resultId.toString() },
    });

    const interpObj = saved.toObject();
    if (interpObj.clinicalNotes) {
      try {
        interpObj.clinicalNotes = decrypt(interpObj.clinicalNotes);
      } catch {
        interpObj.clinicalNotes = '[Decryption Failed]';
      }
    }
    if (interpObj.recommendations) {
      try {
        interpObj.recommendations = decrypt(interpObj.recommendations);
      } catch {
        interpObj.recommendations = '[Decryption Failed]';
      }
    }

    return interpObj;
  },

  async getInterpretations(page: number, limit: number, userRole: string, userId: string, patientIdFilter?: string) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (userRole === 'CLIENT') {
      const patient = await PatientModel.findOne({ userId });
      if (!patient) throw new NotFoundError('Patient profile not found.');
      query.patientId = patient._id;
      query.status = 'PUBLISHED';
    } else {
      if (patientIdFilter) {
        query.patientId = patientIdFilter;
      }
    }

    const [interpretations, total] = await Promise.all([
      InterpretationModel.find(query)
        .populate({
          path: 'patientId',
          select: 'userId',
          populate: { path: 'userId', select: 'firstName lastName email phone' }
        })
        .populate({
          path: 'resultId',
          select: 'laboratoryId panelName referralCode status',
          populate: { path: 'laboratoryId', select: 'name' }
        })
        .skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      InterpretationModel.countDocuments(query),
    ]);

    const decrypted = interpretations.map((interp) => {
      const obj = interp.toObject();
      if (obj.clinicalNotes) {
        try { obj.clinicalNotes = decrypt(obj.clinicalNotes); } catch { obj.clinicalNotes = '[Decryption Failed]'; }
      }
      if (obj.recommendations) {
        try { obj.recommendations = decrypt(obj.recommendations); } catch { obj.recommendations = '[Decryption Failed]'; }
      }
      return obj;
    });

    return createPaginatedResponse(decrypted, page, limitNum, total);
  },

  async getInterpretationById(id: string, userRole: string, userId: string) {
    const interpretation = await InterpretationModel.findById(id)
      .populate('interpreterId', 'firstName lastName role')
      .populate('resultId');
    if (!interpretation) throw new NotFoundError('Interpretation not found.');

    if (userRole === 'CLIENT') {
      const patient = await PatientModel.findOne({ userId });
      if (!patient || interpretation.patientId.toString() !== patient._id.toString()) {
        throw new ForbiddenError('Access denied.');
      }
      if (interpretation.status !== 'PUBLISHED') {
        throw new ForbiddenError('Interpretation is not published.');
      }
    }

    const obj = interpretation.toObject();
    if (obj.clinicalNotes) {
      try { obj.clinicalNotes = decrypt(obj.clinicalNotes); } catch { obj.clinicalNotes = '[Decryption Failed]'; }
    }
    if (obj.recommendations) {
      try { obj.recommendations = decrypt(obj.recommendations); } catch { obj.recommendations = '[Decryption Failed]'; }
    }

    return obj;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateInterpretation(id: string, data: any, userId: string, userRole: string, _ipAddress: string, _userAgent: string) {
    const interpretation = await InterpretationModel.findById(id);
    if (!interpretation) throw new NotFoundError('Interpretation not found.');

    if (interpretation.interpreterId.toString() !== userId.toString() && userRole !== 'ADMIN') {
      throw new ForbiddenError('Only the original interpreter can modify this draft.');
    }

    if (interpretation.status === 'PUBLISHED') {
      throw new ValidationError('Published interpretations cannot be modified.');
    }

    if (data.summary !== undefined) interpretation.summary = data.summary;
    
    if (data.clinicalNotes !== undefined) {
      interpretation.clinicalNotes = data.clinicalNotes ? encrypt(data.clinicalNotes) : null;
    }
    if (data.recommendations !== undefined) {
      interpretation.recommendations = data.recommendations ? encrypt(data.recommendations) : null;
    }

    await interpretation.save();
    return this.getInterpretationById(id, userRole, userId);
  },

  async publishInterpretation(id: string, userId: string, userRole: string, ipAddress: string, userAgent: string) {
    const interpretation = await InterpretationModel.findById(id);
    if (!interpretation) throw new NotFoundError('Interpretation not found.');

    if (interpretation.status === 'PUBLISHED') {
      throw new ValidationError('Interpretation is already published.');
    }

    interpretation.status = 'PUBLISHED';
    await interpretation.save();

    await AuditService.log({
      actorId: userId,
      actorRole: userRole,
      action: 'INTERPRETATION_PUBLISHED',
      resourceType: 'Interpretation',
      resourceId: interpretation.id,
      ipAddress,
      userAgent,
      sessionId: 'internal',
      success: true,
    });

    // Notify patient
    const patient = await PatientModel.findById(interpretation.patientId);
    if (patient) {
      const patientUser = await UserModel.findById(patient.userId);
      if (patientUser) {
        const prefs = await NotificationPreferenceModel.findOne({ userId: patientUser._id });
        if (!prefs || prefs.emailEnabled) {
          await notificationService.sendEmail(
            patientUser.email,
            'Clinical Interpretation Available',
            'interpretation_available',
            { firstName: patientUser.firstName }
          );
        }
      }
    }

    return this.getInterpretationById(id, userRole, userId);
  }
};
