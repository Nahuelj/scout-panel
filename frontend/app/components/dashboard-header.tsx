'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
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
  if (slug === 'saved') return false;
  return true;
}

export default function DashboardHeader() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const user = session?.user;
  const displayName = user?.name?.trim() || user?.email?.trim() || '';
  const isSavedSection = pathname?.startsWith('/players/saved') ?? false;
  const showPlayerDetailSearch = isPlayerDetailPath(pathname ?? null);

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
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-2.5">
      <Link
        href={'/players/saved' as Route}
        prefetch={false}
        data-active={isSavedSection}
        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 text-sm font-medium text-neutral-400 outline-none transition-all duration-200 hover:border-white/[0.13] hover:bg-white/[0.05] hover:text-neutral-200 focus-visible:border-emerald-500/35 focus-visible:ring-2 focus-visible:ring-emerald-500/25 data-[active=true]:border-emerald-500/30 data-[active=true]:bg-emerald-500/[0.08] data-[active=true]:text-emerald-300"
      >
        <Bookmark
          className="size-[15px] shrink-0 transition-colors data-[active=true]:fill-emerald-400/20"
          strokeWidth={1.75}
          aria-hidden
        />
        <span>Saved</span>
      </Link>

      <div className="mx-0.5 h-5 w-px shrink-0 bg-white/[0.08]" aria-hidden />

      {isPending && (
        <div className="flex items-center gap-2.5" aria-hidden>
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="hidden h-3.5 w-20 animate-pulse rounded-full bg-white/[0.06] sm:block" />
        </div>
      )}
      {!isPending && user && (
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
          ? 'flex flex-col gap-4'
          : 'flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6'
      }
    >
      {showPlayerDetailSearch ? (
        <div className="grid w-full grid-cols-1 items-center gap-4 lg:grid-cols-[auto_1fr_auto] lg:gap-6">
          <div className="justify-self-start">{brandLink}</div>
          <div className="flex w-full justify-center lg:min-w-0 lg:px-4">
            {pathname ? (
              <PlayerDetailHeaderSearch currentPlayerId={pathname.slice('/players/'.length)} />
            ) : null}
          </div>
          <div className="flex justify-end lg:justify-self-end">{actionsToolbar}</div>
        </div>
      ) : (
        <>
          <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-h-11 w-max max-w-full items-center lg:w-auto">
              {brandLink}

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

          {actionsToolbar}
        </>
      )}
    </header>
  );
}
