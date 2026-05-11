'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '@/features/auth/api/auth-api';
import { SESSION_QUERY_KEY } from '@/features/auth/hooks/use-session';
import { ApiError } from '@/lib/api-client';
import { ROUTES } from '@/lib/constants';

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

function toFriendlyError(err: unknown, fallback: string): Error {
  if (err instanceof ApiError) {
    const parsed = parseApiErrorBody(err.body);
    return new Error(parsed ?? fallback);
  }
  if (err instanceof Error) return err;
  return new Error(fallback);
}

function parseApiErrorBody(body: string): string | null {
  if (!body) return null;
  try {
    const parsed: unknown = JSON.parse(body);
    if (parsed && typeof parsed === 'object' && 'message' in parsed) {
      const message = (parsed as { message: unknown }).message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message) && typeof message[0] === 'string') {
        return message[0];
      }
    }
  } catch {
    // ignore JSON parse errors
  }
  return null;
}

export function useSignInMutation(options?: { redirectTo?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectTo = options?.redirectTo ?? ROUTES.players;

  return useMutation({
    mutationKey: ['auth', 'signIn'],
    meta: { silent: true },
    mutationFn: async (input: SignInInput) => {
      try {
        return await loginRequest(input);
      } catch (err) {
        throw toFriendlyError(err, 'Invalid credentials');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      router.push(redirectTo);
    },
  });
}

export function useSignUpMutation(options?: { redirectTo?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectTo = options?.redirectTo ?? ROUTES.players;

  return useMutation({
    mutationKey: ['auth', 'signUp'],
    meta: { silent: true },
    mutationFn: async (input: SignUpInput) => {
      try {
        return await registerRequest(input);
      } catch (err) {
        throw toFriendlyError(err, 'Something went wrong');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
      router.push(redirectTo);
    },
  });
}

export function useSignOutMutation(options?: { redirectTo?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectTo = options?.redirectTo ?? ROUTES.login;

  return useMutation({
    mutationKey: ['auth', 'signOut'],
    mutationFn: async () => {
      await logoutRequest();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push(redirectTo);
    },
  });
}
