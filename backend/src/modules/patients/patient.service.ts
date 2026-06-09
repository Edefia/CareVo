import { PatientModel, type IPatient } from './patient.model.js';
import { UserModel } from '../auth/auth.model.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../../shared/errors/index.js';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';

export const patientService = {
  async createProfile(
    userId: string,
    data: Partial<IPatient>,
    createdByLabId?: string | null
  ): Promise<IPatient> {
    const existingPatient = await PatientModel.findOne({ userId });
    if (existingPatient) {
      throw new ConflictError('A patient profile already exists for this user.');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (user.role !== 'PATIENT') {
      throw new ConflictError('Only users with PATIENT role can have a patient profile.');
    }

    const laboratoryIds = createdByLabId ? [createdByLabId] : [];

    const patient = new PatientModel({
      userId,
      ...data,
      laboratoryIds,
    });

    return await patient.save();
  },

  async getPatientById(patientId: string, callerLabId?: string | null): Promise<IPatient> {
    const patient = await PatientModel.findById(patientId).populate('userId', 'email firstName lastName phone');
    if (!patient) {
      throw new NotFoundError('Patient not found.');
    }

    if (callerLabId) {
      // Check if the patient is linked to this lab
      const isLinked = patient.laboratoryIds.some((id) => id.toString() === callerLabId.toString());
      if (!isLinked) {
        throw new ForbiddenError('You do not have access to this patient record.');
      }
    }

    return patient;
  },

  async getPatients(
    page: number,
    limit: number,
    laboratoryIdFilter?: string,
    callerLabId?: string | null
  ) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    
    // If caller is lab scoped, enforce their lab ID
    if (callerLabId) {
      query.laboratoryIds = callerLabId;
    } else if (laboratoryIdFilter) {
      // If caller is platform/super admin, allow filtering
      query.laboratoryIds = laboratoryIdFilter;
    }

    const [patients, total] = await Promise.all([
      PatientModel.find(query).populate('userId', 'email firstName lastName phone').skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      PatientModel.countDocuments(query),
    ]);

    return createPaginatedResponse(patients, page, limitNum, total);
  },

  async updateProfile(
    patientId: string,
    updateData: Partial<IPatient>,
    callerLabId?: string | null
  ): Promise<IPatient> {
    const patient = await PatientModel.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found.');
    }

    if (callerLabId) {
      const isLinked = patient.laboratoryIds.some((id) => id.toString() === callerLabId.toString());
      if (!isLinked) {
        throw new ForbiddenError('You do not have access to this patient record.');
      }
    }

    Object.assign(patient, updateData);
    return await patient.save();
  },

  async linkToLaboratory(patientId: string, laboratoryId: string): Promise<IPatient> {
    const patient = await PatientModel.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found.');
    }

    const alreadyLinked = patient.laboratoryIds.some((id) => id.toString() === laboratoryId.toString());
    if (!alreadyLinked) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (patient.laboratoryIds as any).push(laboratoryId);
      await patient.save();
    }

    return patient;
  },
};
