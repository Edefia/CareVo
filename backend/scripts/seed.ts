import mongoose from 'mongoose';
import * as argon2 from 'argon2';
import { connectDatabase, disconnectDatabase } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { logger } from '../src/utils/logger.js';
import { PermissionModel, UserModel } from '../src/modules/auth/auth.model.js';
import { ROLE_PERMISSIONS, ROLES } from '../src/shared/constants/permissions.js';

async function seed() {
  try {
    await connectDatabase();
    logger.info('🌱 Starting database seed...');

    // 1. Seed Permissions
    logger.info('Seeding role permissions...');
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      await PermissionModel.findOneAndUpdate(
        { role },
        { role, permissions },
        { upsert: true, new: true }
      );
    }
    logger.info('✅ Permissions seeded.');

    // 2. Seed Super Admin
    logger.info('Checking for Super Admin...');
    const adminExists = await UserModel.findOne({ email: env.SEED_ADMIN_EMAIL });

    if (!adminExists) {
      const passwordHash = await argon2.hash(env.SEED_ADMIN_PASSWORD);
      await UserModel.create({
        email: env.SEED_ADMIN_EMAIL,
        passwordHash,
        role: ROLES.SUPER_ADMIN,
        firstName: 'System',
        lastName: 'Admin',
        isEmailVerified: true,
        mfaEnabled: false, // Enforce manually later
      });
      logger.info(`✅ Super Admin created: ${env.SEED_ADMIN_EMAIL}`);
    } else {
      logger.info('Super Admin already exists.');
    }

    logger.info('✅ Database seeding completed successfully.');
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed', { error });
    await disconnectDatabase();
    process.exit(1);
  }
}

seed();
