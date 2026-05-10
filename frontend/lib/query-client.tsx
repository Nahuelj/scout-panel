'use client';

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { toast } from 'sonner';
import { ApiError } from './api-client';
import {
  getErrorMessage,
  isAbortError,
  isUnauthorized,
} from './errors';

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      silent?: boolean;
      ignoreUnauthorized?: boolean;
    };
    mutationMeta: {
      silent?: boolean;
    };
  }
}

function shouldRetry(failureCount: number, err: unknown): boolean {
  if (isAbortError(err)) return false;
  if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
    return false;
  }
  return failureCount < 2;
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (err, query) => {
        if (isAbortError(err)) return;
        if (query.meta?.silent) return;
        if (isUnauthorized(err)) return;
        toast.error(getErrorMessage(err));
      },
    }),
    mutationCache: new MutationCache({
      onError: (err, _vars, _ctx, mutation) => {
        if (isAbortError(err)) return;
        if (mutation.meta?.silent) return;
        toast.error(getErrorMessage(err));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
