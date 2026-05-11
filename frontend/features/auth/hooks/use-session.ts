'use client';

import { useQuery } from '@tanstack/react-query';
import { getMe, type AuthUser } from '@/features/auth/api/auth-api';

export const SESSION_QUERY_KEY = ['auth', 'session'] as const;

export type Session = { user: AuthUser } | null;

export function useSession() {
  const query = useQuery<Session>({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async ({ signal }) => {
      const user = await getMe({ signal });
      return user ? { user } : null;
    },
    retry: false,
    staleTime: 30_000,
    meta: { silent: true },
  });

  return {
    data: query.data ?? null,
    isPending: query.isPending,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
