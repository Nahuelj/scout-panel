'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signIn, signOut, signUp } from '@/features/auth/lib/auth-client';
import { ROUTES } from '@/lib/constants';

export type SignInInput = {
  email: string;
  password: string;
};

export function useSignInMutation(options?: { redirectTo?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectTo = options?.redirectTo ?? ROUTES.players;

  return useMutation({
    mutationKey: ['auth', 'signIn'],
    meta: { silent: true },
    mutationFn: async (input: SignInInput) => {
      const { data, error } = await signIn.email({
        email: input.email,
        password: input.password,
      });
      if (error) {
        throw new Error(error.message ?? 'Invalid credentials');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      router.push(redirectTo);
    },
  });
}

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

export function useSignUpMutation(options?: { redirectTo?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectTo = options?.redirectTo ?? ROUTES.players;

  return useMutation({
    mutationKey: ['auth', 'signUp'],
    meta: { silent: true },
    mutationFn: async (input: SignUpInput) => {
      const { data, error } = await signUp.email({
        name: input.name,
        email: input.email,
        password: input.password,
      });
      if (error) {
        throw new Error(error.message ?? 'Something went wrong');
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
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
      await signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      router.push(redirectTo);
    },
  });
}
