import { ApiError } from './api-client';

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export function isUnauthorized(err: unknown): err is ApiError {
  return err instanceof ApiError && err.status === 401;
}

export function isForbidden(err: unknown): err is ApiError {
  return err instanceof ApiError && err.status === 403;
}

export function isNotFound(err: unknown): err is ApiError {
  return err instanceof ApiError && err.status === 404;
}

export function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === 'AbortError') ||
    (err instanceof Error && err.name === 'AbortError')
  );
}

export function getErrorMessage(err: unknown): string {
  if (isAbortError(err)) return '';
  if (err instanceof ApiError) {
    if (err.status === 401) return 'Your session expired. Please sign in again.';
    if (err.status === 403) return "You don't have permission to do that.";
    if (err.status === 404) return 'Resource not found.';
    if (err.status === 429) return 'Too many requests. Please try again in a moment.';
    if (err.status >= 500) return 'Something went wrong on our side. Please try again.';
    return 'An unexpected error occurred. Please try again.';
  }
  return 'An unexpected error occurred. Please try again.';
}
