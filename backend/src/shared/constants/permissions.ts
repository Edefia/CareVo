import { ROLES, type Role } from './roles.js';

// Permission string constants
export const PERMISSIONS = {
  PATIENTS_READ_ANY: 'patients:read_any',
  PATIENTS_READ_OWN: 'patients:read_own',
  RESULTS_ENTER: 'results:enter',
  RESULTS_SUBMIT: 'results:submit',
  RESULTS_READ: 'results:read',
  INTERPRETATIONS_CREATE: 'interpretations:create',
  INTERPRETATIONS_RELEASE: 'interpretations:release',
  REFERRALS_CREATE: 'referrals:create',
  REFERRALS_UPDATE_STATUS: 'referrals:update_status',
  PAYMENTS_READ_ALL: 'payments:read_all',
  PAYMENTS_READ_OWN: 'payments:read_own',
  AUDIT_LOGS_READ: 'audit_logs:read',
  USERS_INVITE: 'users:invite',
  USERS_DEACTIVATE: 'users:deactivate',
  BOOKINGS_CONFIRM: 'bookings:confirm',
  BOOKINGS_CREATE: 'bookings:create',
  ADVOCATES_MONITOR_PATIENT: 'advocates:monitor_patient',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Complete role-to-permission mapping used by seed script
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS), // Full access
  [ROLES.LABORATORY]: [
    PERMISSIONS.PATIENTS_READ_ANY,
    PERMISSIONS.RESULTS_ENTER,
    PERMISSIONS.RESULTS_SUBMIT,
    PERMISSIONS.BOOKINGS_CONFIRM,
    PERMISSIONS.USERS_INVITE,
  ],
  [ROLES.INTERPRETER]: [
    PERMISSIONS.PATIENTS_READ_ANY,
    PERMISSIONS.RESULTS_READ,
    PERMISSIONS.INTERPRETATIONS_CREATE,
    PERMISSIONS.INTERPRETATIONS_RELEASE,
    PERMISSIONS.REFERRALS_CREATE,
  ],
  [ROLES.CLIENT]: [
    PERMISSIONS.PATIENTS_READ_OWN,
    PERMISSIONS.BOOKINGS_CREATE,
    PERMISSIONS.PAYMENTS_READ_OWN,
  ],
};
