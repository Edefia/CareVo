import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import hpp from 'hpp';
import { env } from './config/env.js';
import { morganStream } from './utils/logger.js';
import { mongoSanitize } from './middleware/mongoSanitize.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { globalErrorHandler } from './middleware/errorHandler.js';

// Routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { laboratoryRoutes } from './modules/laboratories/laboratory.routes.js';
import { staffRoutes } from './modules/staff/staff.routes.js';
import { patientRoutes } from './modules/patients/patient.routes.js';
import { resultRoutes } from './modules/results/result.routes.js';
import { notificationRoutes } from './modules/notifications/notification.routes.js';
import { interpretationRoutes } from './modules/interpretations/interpretation.routes.js';
import { advocacyRoutes } from './modules/advocacy/advocacy.routes.js';
import { bookingRoutes } from './modules/bookings/booking.routes.js';
import { billingRoutes } from './modules/billing/billing.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';
import { packageRoutes } from './modules/packages/package.routes.js';
import { categoryRoutes } from './modules/categories/category.routes.js';

export const app = express();

// Trust proxy if behind Nginx/Load Balancer (essential for rate limiting)
app.set('trust proxy', 1);

// --- Core Middleware ---

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Logging
app.use(morgan('combined', { stream: morganStream }));

// Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Security (NoSQL injection prevention)
app.use(mongoSanitize());

// Security (HTTP Parameter Pollution prevention)
app.use(hpp());

// --- Global Rate Limit ---
app.use('/api', generalLimiter);

// --- Routes ---
app.use('/api/v1', healthRoutes); // e.g. /api/v1/health
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/laboratories', laboratoryRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/results', resultRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/interpretations', interpretationRoutes);
app.use('/api/v1/advocacy', advocacyRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/categories', categoryRoutes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
      details: [],
    },
  });
});

// --- Global Error Handler (Express v5 supports async errors natively) ---
app.use(globalErrorHandler);
