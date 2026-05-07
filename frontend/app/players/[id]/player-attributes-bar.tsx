import type { PlayerDetail } from '@/lib/player-detail-api';

const POSITION_FULL: Record<string, string> = {
  GK: 'Goalkeeper',
  CB: 'Center Back', RB: 'Right Back', LB: 'Left Back',
  RWB: 'Right Wing Back', LWB: 'Left Wing Back',
  CDM: 'Defensive Midfielder', CM: 'Central Midfielder',
  CAM: 'Attacking Midfielder', RM: 'Right Midfielder', LM: 'Left Midfielder',
  RW: 'Right Winger', LW: 'Left Winger',
  ST: 'Striker', CF: 'Center Forward', SS: 'Second Striker',
};

function scoreLabel(value: number | null): string {
  if (value === null) return '';
  if (value >= 8) return 'HIGH';
  if (value >= 5) return 'MED';
  return 'LOW';
}

function scoreLabelColor(value: number | null): string {
  if (value === null) return 'text-neutral-500';
  if (value >= 8) return 'text-emerald-400';
  if (value >= 5) return 'text-amber-400';
  return 'text-red-400';
}

type StatItemProps = {
  label: string;
  children: React.ReactNode;
};

function StatItem({ label, children }: StatItemProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-5 py-5 min-w-0">
      <div className="text-white text-base font-semibold text-center leading-snug">{children}</div>
      <p className="text-neutral-600 text-[10px] uppercase tracking-widest mt-2 text-center px-1">
        {label}
      </p>
    </div>
  );
}

function Divider() {
  return <div className="w-px shrink-0 self-stretch bg-white/5 my-3.5" />;
}

function weakFootAccuracyToRating(accuracyPct: number): number {
  return accuracyPct / 10;
}

function WeakFootRating({
  label,
  accuracyPct,
}: {
  label: string;
  accuracyPct: number;
}) {
  const s = weakFootAccuracyToRating(accuracyPct);
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-neutral-500 text-xs font-medium uppercase mr-0.5">{label}</span>
      <span>{s.toFixed(1)}</span>
      <span className={`text-xs font-bold ${scoreLabelColor(s)}`}>{scoreLabel(s)}</span>
    </span>
  );
}

function SkillfulFootRating({ label, score }: { label: string; score: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-neutral-500 text-xs font-medium uppercase mr-0.5">{label}</span>
      <span>{score.toFixed(1)}</span>
      <span className={`text-xs font-bold ${scoreLabelColor(score)}`}>{scoreLabel(score)}</span>
    </span>
  );
}

type Props = { player: PlayerDetail };

export default function PlayerAttributesBar({ player }: Props) {
  const stats = player.currentSeason?.stats;
  const positionFull = POSITION_FULL[player.position] ?? player.position;

  return (
    <div className="rounded-2xl bg-[#0f1923] border border-white/5 w-full">
      <div className="flex w-full items-stretch min-h-[6rem]">
        <StatItem label="Position">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
            {positionFull}
          </span>
        </StatItem>

        <Divider />

        <StatItem label="Preferred foot">
          <span className="capitalize">
            {player.preferredFoot?.toLowerCase() ?? '—'}
          </span>
        </StatItem>

        <Divider />

        <StatItem label="Height">
          {player.height !== null ? `${player.height} mts` : '—'}
        </StatItem>

        <Divider />

        <StatItem label="Weight">
          {player.weight !== null ? `${player.weight} kg` : '—'}
        </StatItem>

        <Divider />

        {(stats?.skillfulFootPassScore != null ||
          stats?.skillfulFootShotScore != null) && (
          <>
            <StatItem label="Skillful Foot">
              <span className="flex flex-wrap items-center justify-center gap-3 text-sm">
                {stats?.skillfulFootPassScore != null && (
                  <SkillfulFootRating
                    label="Pass"
                    score={stats.skillfulFootPassScore}
                  />
                )}
                {stats?.skillfulFootShotScore != null && (
                  <SkillfulFootRating
                    label="Shot"
                    score={stats.skillfulFootShotScore}
                  />
                )}
              </span>
            </StatItem>
            <Divider />
          </>
        )}
        {(stats?.weakFootPassAccuracyPct !== null ||
          stats?.weakFootShotAccuracyPct !== null) && (
          <>
            <StatItem label="Weak Foot">
              <span className="flex flex-wrap items-center justify-center gap-3 text-sm">
                {stats?.weakFootPassAccuracyPct != null && (
                  <WeakFootRating
                    label="Pass"
                    accuracyPct={stats.weakFootPassAccuracyPct}
                  />
                )}
                {stats?.weakFootShotAccuracyPct != null && (
                  <WeakFootRating
                    label="Shot"
                    accuracyPct={stats.weakFootShotAccuracyPct}
                  />
                )}
              </span>
            </StatItem>
          </>
        )}
      </div>
    </div>
  );
}
