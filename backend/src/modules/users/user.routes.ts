import { Router } from 'express';
import { UserController } from './user.controller.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema, uploadAvatarSchema } from './user.schema.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { PERMISSIONS } from '../../shared/constants/permissions.js';

const router = Router();

router.use(authenticate);

// Self-service endpoints
router.get('/me', UserController.getProfile);
router.patch('/me', validate(updateProfileSchema), UserController.updateProfile);
router.patch('/me/avatar', validate(uploadAvatarSchema), UserController.uploadAvatar);
router.post('/me/password', validate(changePasswordSchema), UserController.changePassword);

// Admin endpoints
router.get('/', authorize([PERMISSIONS.USERS_INVITE]), UserController.getAllUsers);
router.get('/counts', authorize([PERMISSIONS.USERS_INVITE]), UserController.getUserCounts);
router.get('/:id', authorize([PERMISSIONS.USERS_INVITE]), UserController.getUserById);
router.patch('/:id/status', authorize([PERMISSIONS.USERS_DEACTIVATE]), UserController.updateUserStatus);
router.delete('/:id', authorize([PERMISSIONS.USERS_DEACTIVATE]), UserController.deleteUser);

export const userRoutes = router;
