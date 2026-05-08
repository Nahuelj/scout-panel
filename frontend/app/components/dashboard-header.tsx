'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signOut, useSession } from '@/lib/auth-client';

export default function DashboardHeader() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const user = session?.user;
  const displayName = user?.name?.trim() || user?.email?.trim() || '';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
      <Link
        href="/players"
        className="min-w-0 shrink-0 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-emerald-500/50"
      >
        <h1 className="text-2xl font-bold leading-tight text-white">Scouting</h1>
        <p className="mt-0.5 text-sm leading-tight text-neutral-500">Player database</p>
      </Link>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 md:justify-end">
        {isPending && (
          <div className="flex items-center gap-2" aria-hidden>
            <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-700" />
            <div className="hidden h-4 w-24 animate-pulse rounded bg-neutral-700 sm:block" />
          </div>
        )}
        {!isPending && user && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold text-white">
              {displayName ? displayName.charAt(0).toUpperCase() : '?'}
            </div>
            {displayName ? (
              <span className="hidden max-w-[10rem] truncate text-sm text-neutral-400 sm:inline">
                {displayName}
              </span>
            ) : null}
          </div>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-neutral-400 transition-colors hover:border-white/25 hover:text-white"
        >
          <LogOut className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </header>
  );
}
