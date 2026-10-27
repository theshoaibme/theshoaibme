export interface ApiResponseMeta {

  timestamp: string;
  count?: number;
  total?: number;
  version?: string;
  cached?: boolean;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
  meta: ApiResponseMeta;
}

export interface ProjectQueryParams {
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface RequestOptions {
  signal?: AbortSignal;
  force?: boolean;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly originalError?: unknown;

  constructor(message: string, statusCode = 500, originalError?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}
