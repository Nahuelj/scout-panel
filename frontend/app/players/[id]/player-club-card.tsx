import Image from 'next/image';
import { format } from 'date-fns';
import type { PlayerDetail } from '@/lib/player-detail-api';

type Props = { player: PlayerDetail };

export default function PlayerClubCard({ player }: Props) {
  const season = player.currentSeason;

  if (!season) {
    return (
      <div className="rounded-2xl bg-[#0f1923] border border-white/5 p-6 flex items-center justify-center">
        <p className="text-neutral-600 text-sm">No club data</p>
      </div>
    );
  }

  const { club, contractStart, contractEnd } = season;

  const fmt = (date: string | null) =>
    date ? format(new Date(date), 'dd/MM/yy') : '—';

  return (
    <div className="rounded-2xl bg-[#0f1923] border border-white/5 p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
          {club.logoUrl ? (
            <Image
              src={club.logoUrl}
              alt={club.name}
              width={40}
              height={40}
              className="object-contain"
              unoptimized
            />
          ) : (
            <span className="text-lg text-neutral-500">
              {club.shortName ?? club.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">{club.name}</p>
          {club.league && (
            <p className="text-neutral-500 text-xs mt-0.5">{club.league}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3">
        <h3 className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest text-left">
          Contract
        </h3>
        <div className="flex items-center justify-start gap-4">
          <div className="text-left">
            <p className="text-neutral-600 text-[9px] uppercase tracking-widest mb-1">From</p>
            <p className="text-white text-sm font-medium">{fmt(contractStart)}</p>
          </div>
          <div className="h-px w-10 sm:w-16 bg-white/5 shrink-0" />
          <div className="text-left">
            <p className="text-neutral-600 text-[9px] uppercase tracking-widest mb-1">To</p>
            <p className="text-white text-sm font-medium">{fmt(contractEnd)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
