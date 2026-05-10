'use client';

import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <html lang='en' className='dark h-full antialiased'>
      <body className='min-h-screen bg-[#080d14] text-white'>
        <main className='mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center'>
          <div className='mb-6 inline-flex size-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-300'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.75'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='size-6'
              aria-hidden
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='12' y1='8' x2='12' y2='12' />
              <line x1='12' y1='16' x2='12.01' y2='16' />
            </svg>
          </div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Something went wrong
          </h1>
          <p className='mt-2 text-sm text-[#707972]'>
            An unexpected error occurred. You can try again or reload the page.
          </p>
          {error.digest && (
            <p className='mt-3 font-mono text-xs text-[#4b524d]'>
              ref: {error.digest}
            </p>
          )}
          <div className='mt-6 flex gap-3'>
            <button
              type='button'
              onClick={reset}
              className='rounded-lg bg-[#00E094] px-4 py-2 text-sm font-semibold text-[#08110b] shadow-[0_8px_24px_-8px_rgba(0,224,148,0.5)] transition-all hover:bg-[#00E094]/90'
            >
              Try again
            </button>
            <button
              type='button'
              onClick={() => window.location.assign('/')}
              className='rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.05]'
            >
              Go home
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
