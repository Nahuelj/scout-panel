'use client';

import ErrorState from '@/components/shared/error-state';

export default function AuthSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="auth-theme flex min-h-screen items-center justify-center px-6">
      <ErrorState
        error={error}
        reset={reset}
        title="We couldn't load this page"
      />
    </div>
  );
}
