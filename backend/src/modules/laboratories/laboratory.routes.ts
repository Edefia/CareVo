import { Router } from 'express';
import { laboratoryController } from './laboratory.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createLaboratorySchema, updateLaboratorySchema, getLaboratoryParamsSchema } from './laboratory.schema.js';
import { ROLES } from '../../shared/constants/roles.js';

export const laboratoryRoutes = Router();

laboratoryRoutes.use(authenticate);
laboratoryRoutes.use(authorize([ROLES.SUPER_ADMIN, ROLES.PLATFORM_ADMIN]));

laboratoryRoutes.post('/', validate(createLaboratorySchema), laboratoryController.createLaboratory);
laboratoryRoutes.get('/', laboratoryController.getLaboratories);
laboratoryRoutes.get('/:id', validate(getLaboratoryParamsSchema), laboratoryController.getLaboratoryById);
laboratoryRoutes.put('/:id', validate(updateLaboratorySchema), laboratoryController.updateLaboratory);
laboratoryRoutes.delete('/:id', validate(getLaboratoryParamsSchema), laboratoryController.deleteLaboratory);
