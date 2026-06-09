import { Router } from 'express';
import { interpretationController } from './interpretation.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createInterpretationSchema, updateInterpretationSchema, publishInterpretationSchema } from './interpretation.schema.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const interpretationRoutes = Router();

interpretationRoutes.use(authenticate);

// Create interpretation
interpretationRoutes.post('/', authorize([PERMISSIONS.INTERPRETATIONS_CREATE]), validate(createInterpretationSchema), interpretationController.createInterpretation);

// Get interpretations list
interpretationRoutes.get('/', authorize([PERMISSIONS.INTERPRETATIONS_CREATE, PERMISSIONS.PATIENTS_READ_OWN]), interpretationController.getInterpretations);

// Get specific interpretation
interpretationRoutes.get('/:id', authorize([PERMISSIONS.INTERPRETATIONS_CREATE, PERMISSIONS.PATIENTS_READ_OWN]), interpretationController.getInterpretationById);

// Update interpretation (DRAFT only)
interpretationRoutes.put('/:id', authorize([PERMISSIONS.INTERPRETATIONS_CREATE]), validate(updateInterpretationSchema), interpretationController.updateInterpretation);

// Publish interpretation
interpretationRoutes.patch('/:id/publish', authorize([PERMISSIONS.INTERPRETATIONS_RELEASE]), validate(publishInterpretationSchema), interpretationController.publishInterpretation);
