import Image from 'next/image';
import { format } from 'date-fns';
import type { PlayerDetail } from '@/lib/player-detail-api';

type Props = { player: PlayerDetail };

const legibleOnTint =
  '[text-shadow:0_1px_3px_rgba(0,0,0,0.92),0_0_1px_rgba(0,0,0,0.85)]';

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
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0f1923] p-6 flex flex-col gap-5">
      <div className="relative flex min-h-12 items-center gap-3">
        {club.logoUrl ? (
          <div
            className="pointer-events-none absolute left-[84%] top-1/2 z-0 h-[9.75rem] w-[9.75rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.88]"
            aria-hidden
          >
            <Image
              src={club.logoUrl}
              alt=""
              fill
              className="scale-[1.82] object-contain blur-[40px] saturate-[1.62]"
              sizes="176px"
              unoptimized
            />
          </div>
        ) : null}
        <div className="relative z-[1] isolate h-12 w-12 shrink-0">
          {club.logoUrl ? (
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/[0.04]">
              <Image
                src={club.logoUrl}
                alt={club.name}
                fill
                className="object-contain p-1.5"
                sizes="48px"
                unoptimized
              />
            </div>
          ) : (
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/5">
              <span className="text-lg text-neutral-500">
                {club.shortName ?? club.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="relative z-[1] min-w-0">
          <p
            className={`text-white font-bold text-base leading-tight ${legibleOnTint}`}
          >
            {club.name}
          </p>
          {club.league && (
            <p
              className={`text-white/88 font-semibold text-xs mt-0.5 ${legibleOnTint}`}
            >
              {club.league}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-start gap-4">
        <div className="text-left">
          <p
            className={`text-white/82 font-bold text-[10px] uppercase tracking-widest mb-1 ${legibleOnTint}`}
          >
            From
          </p>
          <p className={`text-white text-sm font-semibold ${legibleOnTint}`}>
            {fmt(contractStart)}
          </p>
        </div>
        <div className="h-px w-10 sm:w-16 bg-white/5 shrink-0" />
        <div className="text-left">
          <p
            className={`text-white/82 font-bold text-[10px] uppercase tracking-widest mb-1 ${legibleOnTint}`}
          >
            To
          </p>
          <p className={`text-white text-sm font-semibold ${legibleOnTint}`}>
            {fmt(contractEnd)}
          </p>
        </div>
      </div>
    </div>
  );
}
