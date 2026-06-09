import { Router } from 'express';
import { advocacyController } from './advocacy.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createTaskSchema, updateTaskStatusSchema, addNoteSchema } from './advocacy.schema.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

export const advocacyRoutes = Router();

advocacyRoutes.use(authenticate);

// All advocacy routes require ADVOCATES_MONITOR_PATIENT permission
advocacyRoutes.use(authorize([PERMISSIONS.ADVOCATES_MONITOR_PATIENT]));

// Create task
advocacyRoutes.post('/tasks', validate(createTaskSchema), advocacyController.createTask);

// List tasks
advocacyRoutes.get('/tasks', advocacyController.getTasks);

// Get task by ID
advocacyRoutes.get('/tasks/:id', advocacyController.getTaskById);

// Update task status
advocacyRoutes.patch('/tasks/:id/status', validate(updateTaskStatusSchema), advocacyController.updateTaskStatus);

// Add note to task
advocacyRoutes.post('/tasks/:id/notes', validate(addNoteSchema), advocacyController.addTaskNote);
