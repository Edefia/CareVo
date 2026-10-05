import { Router } from 'express';
import { resultController } from './result.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createResultSchema, updateResultStatusSchema, getResultQuerySchema, getResultParamsSchema, updateResultSchema, submitForApprovalSchema } from './result.schema.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const resultRoutes = Router();

resultRoutes.use(authenticate);

// Create result
resultRoutes.post('/', authorize([PERMISSIONS.RESULTS_ENTER, PERMISSIONS.RESULTS_SUBMIT]), validate(createResultSchema), resultController.createResult);

// Get results list
resultRoutes.get('/', authorize([PERMISSIONS.RESULTS_READ, PERMISSIONS.PATIENTS_READ_OWN, PERMISSIONS.PATIENTS_READ_ANY]), validate(getResultQuerySchema), resultController.getResults);

// Get specific result
resultRoutes.get('/:id', authorize([PERMISSIONS.RESULTS_READ, PERMISSIONS.PATIENTS_READ_OWN, PERMISSIONS.PATIENTS_READ_ANY]), validate(getResultParamsSchema), resultController.getResultById);

// Update result (biomarkers, findings, notes)
resultRoutes.patch('/:id', authorize([PERMISSIONS.RESULTS_ENTER, PERMISSIONS.RESULTS_SUBMIT]), validate(updateResultSchema), resultController.updateResult);

// Submit result for approval
resultRoutes.post('/:id/submit', authorize([PERMISSIONS.RESULTS_SUBMIT]), validate(submitForApprovalSchema), resultController.submitForApproval);

// Update result status
resultRoutes.patch('/:id/status', authorize([PERMISSIONS.RESULTS_SUBMIT]), validate(updateResultStatusSchema), resultController.updateStatus);
