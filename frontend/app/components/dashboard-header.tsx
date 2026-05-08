'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, Home, LogOut, Search } from 'lucide-react';
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

  const headerChipClass =
    'inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-medium text-neutral-300 transition-colors hover:border-white/25 hover:text-white';

  return (
    <header className="mb-8 flex flex-col gap-4 md:grid md:grid-cols-3 md:items-center md:gap-6">
      <div className="flex min-h-10 w-full min-w-0 flex-wrap items-center gap-3 md:justify-self-start">
        <Link
          href="/players"
          className="min-w-0 shrink-0 rounded-lg outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          <h1 className="text-2xl font-bold leading-tight text-white">Scouting</h1>
          <p className="mt-0.5 text-sm leading-tight text-neutral-500">Player database</p>
        </Link>
        <div className="flex min-h-10 min-w-0 flex-1 items-center justify-center">
          <Link href="/players" className={headerChipClass}>
            <Home className="size-4 shrink-0" aria-hidden />
            Home
          </Link>
        </div>
      </div>

      <div className="flex w-full max-w-lg min-h-10 items-center justify-self-center md:mx-auto md:w-full">
        <label className="relative block w-full">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
            aria-hidden
          />
          <input
            type="search"
            name="header-search"
            readOnly
            placeholder="Search players…"
            aria-label="Search players"
            className="h-10 w-full cursor-default rounded-lg border border-white/10 bg-white/5 py-0 pl-10 pr-3 text-sm leading-none text-white outline-none placeholder:text-neutral-500 focus:border-white/20"
          />
        </label>
      </div>

      <div className="flex min-h-10 w-full flex-wrap items-center justify-end gap-3 md:min-w-0 md:justify-self-end">
        <div className="flex min-h-10 min-w-0 flex-1 items-center justify-center">
          <Link href="/players/saved" className={headerChipClass}>
            <Bookmark className="size-4 shrink-0" aria-hidden />
            Saved
          </Link>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
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
      </div>
    </header>
  );
}
