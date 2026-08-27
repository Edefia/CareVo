import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';
import { categoryController } from './category.controller.js';

const router = Router();

// Public: get active categories (for dropdowns)
router.get('/', categoryController.getActiveCategories);

// Admin: full CRUD
router.get('/admin', authenticate, authorize([PERMISSIONS.USERS_INVITE]), categoryController.getAllCategories);
router.post('/', authenticate, authorize([PERMISSIONS.USERS_INVITE]), categoryController.createCategory);
router.put('/:id', authenticate, authorize([PERMISSIONS.USERS_INVITE]), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize([PERMISSIONS.USERS_INVITE]), categoryController.deleteCategory);

export const categoryRoutes = router;
