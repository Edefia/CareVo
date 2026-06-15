import { Router } from 'express';
import { UserController } from './user.controller.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema, uploadAvatarSchema } from './user.schema.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/me', UserController.getProfile);
router.patch('/me', validate(updateProfileSchema), UserController.updateProfile);
router.patch('/me/avatar', validate(uploadAvatarSchema), UserController.uploadAvatar);
router.post('/me/password', validate(changePasswordSchema), UserController.changePassword);

export const userRoutes = router;
