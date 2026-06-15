export const ROLES = {
  ADMIN: 'ADMIN',
  LABORATORY: 'LABORATORY',
  INTERPRETER: 'INTERPRETER',
  CLIENT: 'CLIENT',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = Object.values(ROLES);

// Roles that REQUIRE MFA — cannot log in without it
export const MFA_REQUIRED_ROLES: Role[] = [
  ROLES.ADMIN,
  ROLES.INTERPRETER,
];

// Roles that can only be created via invite (not self-registration)
export const STAFF_ROLES: Role[] = [
  ROLES.ADMIN,
  ROLES.LABORATORY,
  ROLES.INTERPRETER,
];

// Roles that are scoped to a laboratory
export const LAB_SCOPED_ROLES: Role[] = [
  ROLES.LABORATORY,
];
