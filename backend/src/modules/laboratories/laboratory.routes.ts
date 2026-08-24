import { Router } from 'express';
import { laboratoryController } from './laboratory.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { 
  createLaboratorySchema, 
  updateLaboratorySchema, 
  getLaboratoryParamsSchema,
  createLabServiceSchema,
  updateLabServiceSchema,
  getLabServiceParamsSchema
} from './laboratory.schema.js';
import { ROLES } from '../../shared/constants/roles.js';

export const laboratoryRoutes = Router();

laboratoryRoutes.use(authenticate);

laboratoryRoutes.post('/', authorize([ROLES.ADMIN]), validate(createLaboratorySchema), laboratoryController.createLaboratory);
laboratoryRoutes.get('/', laboratoryController.getLaboratories);

// Lab Services (Must be before /:id routes)
laboratoryRoutes.get('/my/services', authorize([ROLES.LABORATORY, ROLES.ADMIN]), laboratoryController.getMyLabServices);
laboratoryRoutes.post('/my/services', authorize([ROLES.LABORATORY, ROLES.ADMIN]), validate(createLabServiceSchema), laboratoryController.createMyLabService);
laboratoryRoutes.put('/my/services/:id', authorize([ROLES.LABORATORY, ROLES.ADMIN]), validate(updateLabServiceSchema), laboratoryController.updateMyLabService);
laboratoryRoutes.delete('/my/services/:id', authorize([ROLES.LABORATORY, ROLES.ADMIN]), validate(getLabServiceParamsSchema), laboratoryController.deleteMyLabService);

// Admin Lab Services Review
laboratoryRoutes.get('/services', authorize([ROLES.ADMIN]), laboratoryController.getAllLabServices);
laboratoryRoutes.put('/services/:id/status', authorize([ROLES.ADMIN]), validate(updateLabServiceSchema), laboratoryController.updateLabServiceStatus);

// Admin Laboratory routes
laboratoryRoutes.get('/:id', validate(getLaboratoryParamsSchema), laboratoryController.getLaboratoryById);
laboratoryRoutes.put('/:id', authorize([ROLES.ADMIN]), validate(updateLaboratorySchema), laboratoryController.updateLaboratory);
laboratoryRoutes.delete('/:id', authorize([ROLES.ADMIN]), validate(getLaboratoryParamsSchema), laboratoryController.deleteLaboratory);
