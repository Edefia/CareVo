import { Router } from 'express';
import { laboratoryController } from './laboratory.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createLaboratorySchema, updateLaboratorySchema, getLaboratoryParamsSchema } from './laboratory.schema.js';
import { ROLES } from '../../shared/constants/roles.js';

export const laboratoryRoutes = Router();

laboratoryRoutes.use(authenticate);

laboratoryRoutes.post('/', authorize([ROLES.ADMIN]), validate(createLaboratorySchema), laboratoryController.createLaboratory);
laboratoryRoutes.get('/', laboratoryController.getLaboratories);
laboratoryRoutes.get('/:id', validate(getLaboratoryParamsSchema), laboratoryController.getLaboratoryById);
laboratoryRoutes.put('/:id', authorize([ROLES.ADMIN]), validate(updateLaboratorySchema), laboratoryController.updateLaboratory);
laboratoryRoutes.delete('/:id', authorize([ROLES.ADMIN]), validate(getLaboratoryParamsSchema), laboratoryController.deleteLaboratory);
