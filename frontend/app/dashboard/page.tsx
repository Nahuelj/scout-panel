'use client';

import { useRouter } from 'next/navigation';
import { signOut, useSession } from '../../lib/auth-client';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Dashboard
          </h1>
          <button
            onClick={handleSignOut}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-4">
            Session
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-lg font-semibold text-neutral-600 dark:text-neutral-300">
                {session?.user.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {session?.user.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {session?.user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
