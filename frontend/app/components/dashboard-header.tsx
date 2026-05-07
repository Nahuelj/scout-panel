'use client';

import { useRouter } from 'next/navigation';
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
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Scouting</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Player database</p>
      </div>
      <div className="flex items-center gap-3">
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
          onClick={handleSignOut}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:border-white/25 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
