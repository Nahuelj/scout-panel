'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelectionStore } from '@/lib/selection-store';

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

  const label = count === 1 ? 'VIEW DETAILS' : `COMPARE ${count} PLAYERS`;

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto max-w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-4 rounded-2xl bg-[#0f1923]/95 backdrop-blur border border-white/10 px-4 py-3 shadow-2xl">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {selectedPlayers.map((player, i) => (
                <div
                  key={player.id}
                  className="relative w-9 h-9 rounded-full border-2 border-[#0f1923] overflow-hidden bg-neutral-700 flex-shrink-0"
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
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 font-bold">
                      {player.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-white text-sm font-semibold whitespace-nowrap">
            {count} {count === 1 ? 'PLAYER' : 'PLAYERS'} SELECTED
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAction}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-colors px-5 py-2 text-sm font-bold text-black whitespace-nowrap"
            >
              {label}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-xl border border-white/10 hover:border-white/25 px-3 py-2 text-neutral-400 hover:text-white transition-colors"
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
