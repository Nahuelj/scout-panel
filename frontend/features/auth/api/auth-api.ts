import { apiFetch, ApiError } from '@/lib/api-client';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthResponse = {
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  name: string;
  password: string;
};

export async function login(input: LoginInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function logout(): Promise<void> {
  await apiFetch('/auth/logout', {
    method: 'POST',
    parseJson: false,
  });
}

export async function getMe(options?: {
  signal?: AbortSignal;
}): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>('/auth/me', { signal: options?.signal });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}
