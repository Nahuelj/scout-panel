import { ApiError } from './api-client';
import {
  getErrorMessage,
  isAbortError,
  isApiError,
  isForbidden,
  isNotFound,
  isUnauthorized,
} from './errors';

describe('isApiError', () => {
  it('returns true for ApiError instances', () => {
    expect(isApiError(new ApiError('x', 500, ''))).toBe(true);
  });

  it('returns false for plain Errors and unknown values', () => {
    expect(isApiError(new Error('x'))).toBe(false);
    expect(isApiError('string')).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
  });
});

describe('status-specific guards', () => {
  it('isUnauthorized matches only 401', () => {
    expect(isUnauthorized(new ApiError('', 401, ''))).toBe(true);
    expect(isUnauthorized(new ApiError('', 403, ''))).toBe(false);
    expect(isUnauthorized(new Error('x'))).toBe(false);
  });

  it('isForbidden matches only 403', () => {
    expect(isForbidden(new ApiError('', 403, ''))).toBe(true);
    expect(isForbidden(new ApiError('', 401, ''))).toBe(false);
  });

  it('isNotFound matches only 404', () => {
    expect(isNotFound(new ApiError('', 404, ''))).toBe(true);
    expect(isNotFound(new ApiError('', 500, ''))).toBe(false);
  });
});

describe('isAbortError', () => {
  it('detects DOMException AbortError', () => {
    const err = new DOMException('aborted', 'AbortError');
    expect(isAbortError(err)).toBe(true);
  });

  it('detects regular Error named AbortError', () => {
    const err = new Error('aborted');
    err.name = 'AbortError';
    expect(isAbortError(err)).toBe(true);
  });

  it('returns false for other errors', () => {
    expect(isAbortError(new Error('boom'))).toBe(false);
    expect(isAbortError(null)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('returns empty string for abort errors', () => {
    const err = new Error();
    err.name = 'AbortError';
    expect(getErrorMessage(err)).toBe('');
  });

  it('returns specific message for 401', () => {
    expect(getErrorMessage(new ApiError('', 401, ''))).toBe(
      'Your session expired. Please sign in again.',
    );
  });

  it('returns specific message for 403', () => {
    expect(getErrorMessage(new ApiError('', 403, ''))).toBe(
      "You don't have permission to do that.",
    );
  });

  it('returns specific message for 404', () => {
    expect(getErrorMessage(new ApiError('', 404, ''))).toBe('Resource not found.');
  });

  it('returns specific message for 429', () => {
    expect(getErrorMessage(new ApiError('', 429, ''))).toBe(
      'Too many requests. Please try again in a moment.',
    );
  });

  it('returns server-side message for 5xx', () => {
    expect(getErrorMessage(new ApiError('', 500, ''))).toBe(
      'Something went wrong on our side. Please try again.',
    );
    expect(getErrorMessage(new ApiError('', 503, ''))).toBe(
      'Something went wrong on our side. Please try again.',
    );
  });

  it('returns generic ApiError message for other statuses', () => {
    expect(getErrorMessage(new ApiError('', 418, ''))).toBe(
      'An unexpected error occurred. Please try again.',
    );
  });

  it('returns generic message for unknown errors', () => {
    expect(getErrorMessage(new Error('boom'))).toBe(
      'An unexpected error occurred. Please try again.',
    );
    expect(getErrorMessage('something')).toBe(
      'An unexpected error occurred. Please try again.',
    );
  });
});
