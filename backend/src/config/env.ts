import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  FRONTEND_URL: z.string().url(),

  // Database
  MONGODB_URI: z.string().min(1),

  // Redis
  REDIS_URL: z.string().min(1),

  // JWT — min 64 chars, access and refresh must be different
  JWT_ACCESS_SECRET: z.string().min(64),
  JWT_REFRESH_SECRET: z.string().min(64),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // Field-level encryption — 64-char hex string (32 bytes for AES-256-GCM)
  FIELD_ENCRYPTION_KEY: z.string().length(64).regex(/^[0-9a-fA-F]+$/),

  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().min(1),

  // Email
  SENDGRID_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email(),

  // SMS
  TERMII_API_KEY: z.string().min(1),

  // Payments
  PAYSTACK_SECRET_KEY: z.string().min(1),
  FLUTTERWAVE_SECRET_KEY: z.string().min(1),
  HUBTEL_CLIENT_ID: z.string().min(1),
  HUBTEL_CLIENT_SECRET: z.string().min(1),

  // Seed
  SEED_ADMIN_EMAIL: z.string().email(),
  SEED_ADMIN_PASSWORD: z.string().min(12),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n'));
    process.exit(1);
  }

  // Ensure access and refresh secrets are different
  if (result.data.JWT_ACCESS_SECRET === result.data.JWT_REFRESH_SECRET) {
    console.error('❌ JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different.');
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
