export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  LAB_ADMIN: 'LAB_ADMIN',
  LAB_STAFF: 'LAB_STAFF',
  INTERPRETER: 'INTERPRETER',
  HEALTH_ADVOCATE: 'HEALTH_ADVOCATE',
  REFERRAL_PARTNER: 'REFERRAL_PARTNER',
  PATIENT: 'PATIENT',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = Object.values(ROLES);

// Roles that REQUIRE MFA — cannot log in without it
export const MFA_REQUIRED_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.PLATFORM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.INTERPRETER,
];

// Roles that can only be created via invite (not self-registration)
export const STAFF_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.PLATFORM_ADMIN,
  ROLES.LAB_ADMIN,
  ROLES.LAB_STAFF,
  ROLES.INTERPRETER,
  ROLES.HEALTH_ADVOCATE,
  ROLES.REFERRAL_PARTNER,
];

// Roles that are scoped to a laboratory
export const LAB_SCOPED_ROLES: Role[] = [
  ROLES.LAB_ADMIN,
  ROLES.LAB_STAFF,
];
