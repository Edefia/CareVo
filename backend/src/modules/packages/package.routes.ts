import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';
import { getActivePackages, createPackage } from './package.controller.js';

const router = Router();

// Public / Client route to see available packages
router.get('/', getActivePackages);

// Admin only route to create a package (assuming ADMIN has USERS_INVITE or using specific perm)
router.post('/', authenticate, authorize([PERMISSIONS.USERS_INVITE]), createPackage);

export const packageRoutes = router;
