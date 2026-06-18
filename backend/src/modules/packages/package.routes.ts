import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';
import { packageController } from './package.controller.js';

const router = Router();

// Public / Client route to see available packages
router.get('/', packageController.getActivePackages);

// Admin routes (protected)
router.get('/admin', authenticate, authorize([PERMISSIONS.USERS_INVITE]), packageController.getAllPackages);
router.get('/:id', authenticate, authorize([PERMISSIONS.USERS_INVITE]), packageController.getPackageById);
router.post('/', authenticate, authorize([PERMISSIONS.USERS_INVITE]), packageController.createPackage);
router.put('/:id', authenticate, authorize([PERMISSIONS.USERS_INVITE]), packageController.updatePackage);
router.delete('/:id', authenticate, authorize([PERMISSIONS.USERS_INVITE]), packageController.deletePackage);

export const packageRoutes = router;
