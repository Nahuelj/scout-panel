'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export type ErrorStateProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  className?: string;
};

export default function ErrorState({
  error,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please refresh the page or contact support if the problem persists.',
  className,
}: ErrorStateProps) {
  useEffect(() => {
    console.error('[RouteError]', error);
  }, [error]);

  return (
    <div
      className={
        className ??
        'mx-auto flex w-full max-w-md flex-col items-center justify-center gap-3 py-24 text-center'
      }
    >
      <div className="inline-flex size-10 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold tracking-tight text-white">
        {title}
      </h2>
      <p className="max-w-sm text-sm text-[#707972]">{description}</p>
      <div className="mt-2">
        <Button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-[#00E094] font-semibold text-[#08110b] shadow-[0_8px_24px_-8px_rgba(0,224,148,0.5)] transition-all hover:bg-[#00E094]/90"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
