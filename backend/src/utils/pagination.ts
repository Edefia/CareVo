import type { IPaginationOptions, IPaginationMeta } from '../shared/types/index.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePaginationParams(query: Record<string, unknown>): IPaginationOptions {
  let page = Number(query.page) || DEFAULT_PAGE;
  let limit = Number(query.limit) || DEFAULT_LIMIT;

  if (page < 1) page = DEFAULT_PAGE;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  return { page, limit };
}

export function buildPaginationMeta(
  totalCount: number,
  page: number,
  limit: number,
): IPaginationMeta {
  return {
    page,
    totalPages: Math.ceil(totalCount / limit) || 1,
    totalCount,
  };
}

export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function getPaginationOptions(page: number, limit: number) {
  const p = Math.max(1, page);
  const l = Math.min(Math.max(1, limit), 100);
  return {
    skip: (p - 1) * l,
    limit: l,
  };
}

export function createPaginatedResponse<T>(data: T[], page: number, limit: number, totalCount: number) {
  return {
    success: true,
    data,
    meta: buildPaginationMeta(totalCount, page, limit),
  };
}
