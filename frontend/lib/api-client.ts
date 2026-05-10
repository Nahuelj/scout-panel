function coerceServerLoopbackOrigin(url: string): string {
  if (typeof window !== 'undefined') return url;
  try {
    const u = new URL(url);
    if (u.hostname === 'localhost') {
      u.hostname = '127.0.0.1';
    }
    return u.origin;
  } catch {
    return url;
  }
}

export function getApiOrigin(): string {
  const configured =
    typeof process.env.NEXT_PUBLIC_API_URL === 'string'
      ? process.env.NEXT_PUBLIC_API_URL.trim()
      : '';

  const base =
    configured.length > 0
      ? configured.replace(/\/$/, '')
      : typeof window === 'undefined'
        ? 'http://127.0.0.1:8080'
        : 'http://localhost:8080';

  return coerceServerLoopbackOrigin(base);
}

export class ApiError extends Error {
  status: number;
  body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function formatApiConnectionError(url: string, cause: unknown): Error {
  const detail = cause instanceof Error ? cause.message : String(cause);
  const message = [
    'Cannot reach the API.',
    'Start the Nest backend (e.g. pnpm dev in backend/) on the port you use (default 8080),',
    'or set NEXT_PUBLIC_API_URL in frontend/.env.local to the API base URL (no trailing slash).',
    `Request: ${url}`,
    `Detail: ${detail}`,
  ].join(' ');
  return new Error(message, { cause });
}

export type ApiFetchOptions = RequestInit & {
  skipCredentials?: boolean;
  parseJson?: boolean;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipCredentials, parseJson = true, ...init } = options;
  const url = `${getApiOrigin()}${path.startsWith('/') ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: 'no-store',
      credentials: skipCredentials ? 'omit' : 'include',
      ...init,
    });
  } catch (err) {
    throw formatApiConnectionError(url, err);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const detail = body.length > 500 ? `${body.slice(0, 500)}…` : body;
    throw new ApiError(
      `API request failed (${res.status} ${res.statusText}). ${detail}`.trim(),
      res.status,
      body,
    );
  }

  if (!parseJson) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export type ApiFetchServerOptions = RequestInit & {
  parseJson?: boolean;
};

export async function apiFetchServer<T = unknown>(
  path: string,
  cookieHeader: string,
  options: ApiFetchServerOptions = {},
): Promise<T> {
  const { parseJson = true, headers, ...init } = options;
  const url = `${getApiOrigin()}${path.startsWith('/') ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      cache: 'no-store',
      ...init,
      headers: {
        ...headers,
        Cookie: cookieHeader,
      },
    });
  } catch (err) {
    throw formatApiConnectionError(url, err);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const detail = body.length > 500 ? `${body.slice(0, 500)}…` : body;
    throw new ApiError(
      `API request failed (${res.status} ${res.statusText}). ${detail}`.trim(),
      res.status,
      body,
    );
  }

  if (!parseJson) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
