import { registerSchema } from './src/modules/auth/auth.schema.js';

const payload = {
  email: 'test@example.com',
  password: 'Password123!@#',
  firstName: 'John',
  lastName: 'Doe',
};

const result = registerSchema.safeParse(payload);
if (!result.success) {
  console.error(result.error.issues);
} else {
  console.log('Success!');
}
