import { Router } from 'express';
import { patientController } from './patient.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createPatientProfileSchema, updatePatientProfileSchema, getPatientsQuerySchema, getPatientParamsSchema } from './patient.schema.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const patientRoutes = Router();

patientRoutes.use(authenticate);

// Create patient profile
patientRoutes.post('/', authorize([PERMISSIONS.PATIENTS_READ_ANY, PERMISSIONS.PATIENTS_READ_OWN]), validate(createPatientProfileSchema), patientController.createProfile);

// Get patients list
patientRoutes.get('/', authorize([PERMISSIONS.PATIENTS_READ_ANY]), validate(getPatientsQuerySchema), patientController.getPatients);

// Get specific patient
patientRoutes.get('/:id', authorize([PERMISSIONS.PATIENTS_READ_ANY, PERMISSIONS.PATIENTS_READ_OWN]), validate(getPatientParamsSchema), patientController.getPatientById);

// Update patient profile
patientRoutes.put('/:id', authorize([PERMISSIONS.PATIENTS_READ_ANY, PERMISSIONS.PATIENTS_READ_OWN]), validate(updatePatientProfileSchema), patientController.updateProfile);
