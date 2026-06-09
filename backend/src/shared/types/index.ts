import type { Role } from '../constants/roles.js';

export interface ITokenPayload {
  userId: string;
  email: string;
  role: Role;
  laboratoryId: string | null;
  organisationId: string | null;
  sessionId: string;
}

export interface IPaginationOptions {
  page: number;
  limit: number;
}

export interface IPaginationMeta {
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface IApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: IPaginationMeta;
}

export interface IApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
}

export type IApiResponse<T = unknown> = IApiSuccessResponse<T> | IApiErrorResponse;

export interface IAuditLogEntry {
  actorId: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  previousState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  success: boolean;
  failureReason?: string | null;
}
