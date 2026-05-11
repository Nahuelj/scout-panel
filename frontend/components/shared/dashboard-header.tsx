'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Bookmark, ChevronDown, Crosshair, LogOut, Search } from 'lucide-react';
import { DropdownMenu } from 'radix-ui';
import { useSession } from '@/features/auth/hooks/use-session';
import { useSignOutMutation } from '@/features/auth/hooks/use-auth-mutations';
import { cn } from '@/lib/utils';
import { PlayerDetailHeaderSearch } from '@/features/players';

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
  <div
    className="flex h-9 max-w-[min(18rem,calc(100vw-5.5rem))] items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] py-1 pl-1 pr-2.5"
    aria-hidden
  >
    <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
    <div className="h-3.5 min-w-0 flex-1 animate-pulse rounded-full bg-white/[0.06]" />
    <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-white/[0.06]" />
  </div>
);

const accountMenuContentClass =
  'z-50 flex min-w-[12rem] flex-col gap-1 overflow-hidden rounded-xl border border-white/[0.1] bg-[#0c141c] p-1.5 shadow-xl shadow-black/50';

const accountMenuItemClass =
  'flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none';

function accountNavItemClass(active: boolean) {
  return cn(
    accountMenuItemClass,
    active
      ? 'bg-emerald-500/15 font-medium text-emerald-200 data-highlighted:bg-emerald-500/22 data-highlighted:text-emerald-100'
      : 'text-neutral-200 data-highlighted:bg-white/[0.06]',
  );
}

export default function DashboardHeader() {
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const signOutMutation = useSignOutMutation();

  useEffect(() => {
    setMounted(true);
  }, []);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = session?.user;
  const displayName = user?.name?.trim() || user?.email?.trim() || '';
  const isShortlistSection = pathname?.startsWith('/players/shortlist') ?? false;
  const isFindSectionActive = !isShortlistSection;
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

  const handleSignOut = () => {
    signOutMutation.mutate();
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
      {!mounted || isPending ? (
        sessionUserSkeleton
      ) : user ? (
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-haspopup="menu"
              aria-label="Account menu"
              className="inline-flex max-w-[min(18rem,calc(100vw-5.5rem))] items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] py-1 pl-1 pr-2 text-left text-sm outline-none transition-all duration-200 hover:border-white/[0.13] hover:bg-white/[0.05] focus-visible:border-emerald-500/40 focus-visible:ring-2 focus-visible:ring-emerald-500/25 data-[state=open]:border-white/[0.13] data-[state=open]:bg-white/[0.05] [&[data-state=open]>svg:last-child]:rotate-180"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 text-xs font-semibold text-white shadow-inner ring-1 ring-white/[0.1]">
                {displayName ? displayName.charAt(0).toUpperCase() : '?'}
              </div>
              <span className="min-w-0 flex-1 truncate font-medium text-neutral-200">
                {displayName || 'Account'}
              </span>
              <ChevronDown
                className="size-4 shrink-0 text-neutral-500 transition-transform duration-200"
                strokeWidth={2}
                aria-hidden
              />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className={accountMenuContentClass}
            >
              <DropdownMenu.Item
                className={accountNavItemClass(isFindSectionActive)}
                aria-current={isFindSectionActive ? 'page' : undefined}
                onSelect={() => router.push('/players' as Route)}
              >
                <Search
                  className={cn(
                    'size-[15px] shrink-0',
                    isFindSectionActive ? 'text-emerald-400/90' : 'text-neutral-500',
                  )}
                  strokeWidth={1.75}
                  aria-hidden
                />
                Find players
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={accountNavItemClass(isShortlistSection)}
                aria-current={isShortlistSection ? 'page' : undefined}
                onSelect={() => router.push('/players/shortlist' as Route)}
              >
                <Bookmark
                  className={cn(
                    'size-[15px] shrink-0',
                    isShortlistSection ? 'text-emerald-400/90' : 'text-neutral-500',
                  )}
                  strokeWidth={1.75}
                  aria-hidden
                />
                Shortlists
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px w-full shrink-0 bg-white/[0.08]" />
              <DropdownMenu.Item
                className={`${accountMenuItemClass} text-red-300 data-highlighted:bg-red-500/10 data-highlighted:text-red-200`}
                onSelect={() => handleSignOut()}
              >
                <LogOut className="size-[15px] shrink-0" strokeWidth={1.75} aria-hidden />
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ) : null}
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
