'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Bookmark, LogOut, Crosshair } from 'lucide-react';
import { signOut, useSession } from '@/lib/auth-client';
import PlayerDetailHeaderSearch from '@/app/components/player-detail-header-search';

const WORKFLOW_STEPS = [
  { n: '1', label: 'Find' },
  { n: '2', label: 'Analyze' },
  { n: '3', label: 'Scout' },
] as const;

function StepConnector() {
  return (
    <div className="mx-2 flex shrink-0 items-center gap-0.5 sm:mx-3" aria-hidden>
      <span className="h-px w-3 bg-gradient-to-r from-white/[0.06] to-white/[0.12]" />
      <span className="h-px w-5 bg-white/[0.12]" />
      <span className="h-px w-3 bg-gradient-to-r from-white/[0.12] to-white/[0.06]" />
    </div>
  );
}

function isPlayerDetailPath(pathname: string | null): boolean {
  if (!pathname?.startsWith('/players/')) return false;
  const slug = pathname.slice('/players/'.length);
  if (!slug || slug.includes('/')) return false;
  if (slug === 'shortlist') return false;
  return true;
}

function isComparePath(pathname: string | null): boolean {
  return pathname === '/compare';
}

const sessionUserSkeleton = (
  <div className="flex items-center gap-2.5" aria-hidden>
    <div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.06]" />
    <div className="hidden h-3.5 w-20 animate-pulse rounded-full bg-white/[0.06] sm:block" />
  </div>
);

export default function DashboardHeader() {
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = session?.user;
  const displayName = user?.name?.trim() || user?.email?.trim() || '';
  const isShortlistSection = pathname?.startsWith('/players/shortlist') ?? false;
  const onPlayerDetail = isPlayerDetailPath(pathname ?? null);
  const onCompare = isComparePath(pathname ?? null);
  const showPlayerDetailSearch = onPlayerDetail || onCompare;

  const compareIdsParam = searchParams?.get('ids') ?? '';
  const searchCurrentIds = useMemo(() => {
    if (onCompare) {
      return Array.from(
        new Set(
          compareIdsParam
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      );
    }
    if (onPlayerDetail && pathname) {
      return [pathname.slice('/players/'.length)];
    }
    return [];
  }, [onCompare, onPlayerDetail, pathname, compareIdsParam]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const brandLink = (
    <Link
      href={'/players' as Route}
      className="group inline-flex w-max shrink-0 items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2.5 outline-none transition-all duration-200 hover:border-emerald-500/35 hover:bg-emerald-500/[0.10] focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/25"
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/[0.15] ring-1 ring-emerald-400/20 transition-all duration-200 group-hover:bg-emerald-500/[0.22] group-hover:ring-emerald-400/35" aria-hidden>
        <Crosshair className="size-3.5 text-emerald-400" strokeWidth={1.75} />
      </span>
      <span className="text-base font-bold tracking-tight text-white">
        Scout<span className="text-emerald-400">DB</span>
      </span>
    </Link>
  );

  const actionsToolbar = (
    <div className="flex shrink-0 flex-nowrap items-center justify-end gap-2 sm:gap-2.5">
      <Link
        href={'/players/shortlist' as Route}
        prefetch={false}
        data-active={isShortlistSection}
        aria-label="Shortlist"
        className="group inline-flex shrink-0 items-center gap-1.5 py-1 text-sm font-medium text-neutral-400 underline-offset-[6px] transition-colors duration-200 hover:text-sky-300 hover:underline focus-visible:rounded-sm focus-visible:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/35 data-[active=true]:font-semibold data-[active=true]:text-sky-300 data-[active=true]:underline"
      >
        <Bookmark
          className="size-[15px] shrink-0 text-neutral-500 transition-colors group-hover:text-sky-300 group-data-[active=true]:fill-sky-400/20 group-data-[active=true]:text-sky-300"
          strokeWidth={1.75}
          aria-hidden
        />
        <span className="hidden sm:inline">Shortlist</span>
      </Link>

      <div className="mx-0.5 h-5 w-px shrink-0 bg-white/[0.08]" aria-hidden />

      {!mounted || isPending
        ? sessionUserSkeleton
        : user && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 text-sm font-semibold text-white shadow-inner ring-1 ring-white/[0.1]">
                {displayName ? displayName.charAt(0).toUpperCase() : '?'}
              </div>
              {displayName ? (
                <span className="hidden max-w-[9rem] truncate text-sm text-neutral-400 sm:inline">
                  {displayName}
                </span>
              ) : null}
            </div>
          )}

      <button
        type="button"
        onClick={handleSignOut}
        aria-label="Sign out"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025] text-neutral-500 transition-all duration-200 hover:border-white/[0.13] hover:bg-white/[0.05] hover:text-neutral-200"
      >
        <LogOut className="size-[15px] shrink-0" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );

  return (
    <header
      className={
        showPlayerDetailSearch
          ? 'min-w-0 w-full'
          : 'flex flex-row items-center justify-between gap-4 lg:gap-6'
      }
    >
      {showPlayerDetailSearch ? (
        <div className="grid w-full min-w-0 grid-cols-[1fr_auto] gap-x-2 gap-y-3 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-x-3 md:gap-y-0 lg:gap-x-4">
          <div className="min-w-0 shrink-0 justify-self-start">{brandLink}</div>
          <div className="col-start-2 row-start-1 justify-self-end md:col-start-3 md:justify-self-end">
            {actionsToolbar}
          </div>
          <div className="col-span-2 col-start-1 row-start-2 min-w-0 w-full md:col-span-1 md:col-start-2 md:row-start-1 md:flex md:justify-center md:px-2 lg:px-4">
            <PlayerDetailHeaderSearch currentIds={searchCurrentIds} />
          </div>
        </div>
      ) : (
        <>
          <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-h-11 w-max max-w-full items-center lg:w-auto">
              {brandLink}

              <div className="hidden shrink-0 items-center lg:flex">
                <StepConnector />

                {WORKFLOW_STEPS.map((step, i) => (
                  <Fragment key={step.n}>
                    <div
                      className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-sm transition-colors"
                      aria-label={`Step ${step.n}: ${step.label}`}
                    >
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[10px] font-semibold tabular-nums text-neutral-400">
                        {step.n}
                      </span>
                      <span className="text-neutral-300">{step.label}</span>
                    </div>
                    {i < WORKFLOW_STEPS.length - 1 ? <StepConnector /> : null}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>

          {actionsToolbar}
        </>
      )}
    </header>
  );
}
