export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallback;
}

export function getDisplayErrorMessage(
  error: unknown,
  fallback = 'Something went wrong while loading this page. Please refresh and try again.',
): string {
  const message = getErrorMessage(error, fallback);

  if (/Cannot read propert(y|ies) of (undefined|null)/i.test(message)) {
    return 'Something went wrong while loading this page. Refreshing usually fixes it.';
  }

  return message;
}

export class DataLoadError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'DataLoadError';
    this.cause = cause;
  }
}

export class DataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataValidationError';
  }
}
