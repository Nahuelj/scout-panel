'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelectionStore } from '@/stores/selection-store';

export default function SelectionBar() {
  const { selectedPlayers, clearSelection } = useSelectionStore();
  const router = useRouter();
  const count = selectedPlayers.length;

  if (count === 0) return null;

  const handleAction = () => {
    if (count === 1) {
      const id = selectedPlayers[0].id;
      clearSelection();
      router.push(`/players/${id}`);
    } else {
      const ids = selectedPlayers.map((p) => p.id).join(',');
      clearSelection();
      router.push(`/compare?ids=${ids}`);
    }
  };

  const actionLabelLong = count === 1 ? 'VIEW DETAILS' : `COMPARE ${count} PLAYERS`;
  const actionLabelShort = count === 1 ? 'DETAILS' : `COMPARE (${count})`;

  return (
    <div className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-3 sm:px-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto w-full max-w-[min(100%,42rem)] animate-in fade-in slide-in-from-bottom-4 duration-200 sm:max-w-none sm:w-auto">
        <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-[#0f1923]/95 px-3 py-3 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:gap-4 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <div className="flex shrink-0 items-center">
              <div className="flex max-w-[min(100%,11rem)] -space-x-2 overflow-hidden sm:max-w-none">
                {selectedPlayers.map((player, i) => (
                  <div
                    key={player.id}
                    className="relative size-8 shrink-0 overflow-hidden rounded-full border-2 border-[#0f1923] bg-neutral-700 sm:size-9"
                    style={{ zIndex: selectedPlayers.length - i }}
                  >
                    {player.photoUrl ? (
                      <Image
                        src={player.photoUrl}
                        alt={player.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-400">
                        {player.name.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wide text-white sm:flex-none sm:text-sm">
              <span className="line-clamp-2 sm:whitespace-nowrap">
                {count} {count === 1 ? 'PLAYER' : 'PLAYERS'} SELECTED
              </span>
            </p>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:shrink-0">
            <button
              type="button"
              onClick={handleAction}
              className="min-w-0 flex-1 truncate rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold uppercase tracking-wide text-black transition-colors hover:bg-emerald-400 sm:flex-none sm:px-5 sm:text-sm"
            >
              <span className="sm:hidden">{actionLabelShort}</span>
              <span className="hidden sm:inline">{actionLabelLong}</span>
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-neutral-400 transition-colors hover:border-white/25 hover:text-white"
              aria-label="Clear selection"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
