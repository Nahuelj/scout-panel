import type { PlayerDetailStats } from './player-detail-api';

export type StatFormatKind = 'number' | 'percentage' | 'decimal';

export type StatMetricMeta = {
  label: string;
  description: string;
  formatKind: StatFormatKind;
};

export type StatCategory = {
  title: string;
  metrics: (keyof PlayerDetailStats)[];
};

export const STAT_CATEGORIES: Record<string, StatCategory> = {
  SHO: {
    title: 'SHO — Shooting',
    metrics: [
      'goalsPer90',
      'xGPer90',
      'shotAccuracyPct',
      'conversionRatePct',
      'shotsOnTarget',
      'touchesInBox',
      'weakFootShotPct',
      'weakFootGoals',
      'weakFootShotAccuracyPct',
      'skillfulFootShotScore',
    ],
  },
  PAS: {
    title: 'PAS — Passing',
    metrics: [
      'passAccuracyPct',
      'progressivePasses',
      'keyPasses',
      'throughBalls',
      'crossAccuracyPct',
      'xA',
      'weakFootPassPct',
      'weakFootPassAccuracyPct',
      'progressiveWfPasses',
      'skillfulFootPassScore',
    ],
  },
  PHY: {
    title: 'PHY — Physical',
    metrics: [
      'physicalDuelsWonPct',
      'strengthDuels',
      'balance',
      'stamina',
      'bodyContactSuccessPct',
    ],
  },
  DEF: {
    title: 'DEF — Defending',
    metrics: [
      'tacklesWonPct',
      'interceptions',
      'recoveries',
      'blocks',
      'aerialDuelsWonPct',
      'clearances',
    ],
  },
  PAC: {
    title: 'PAC — Pace',
    metrics: [
      'topSpeed',
      'sprintDistance',
      'accelerations',
      'progressiveRuns',
      'distanceCovered',
    ],
  },
  DRI: {
    title: 'DRI — Dribbling',
    metrics: [
      'dribblesAttempted',
      'dribbleSuccessPct',
      'progressiveCarries',
      'carriesIntoFinalThird',
      'ballRetentionPct',
      'foulsWon',
    ],
  },
};

export function categoryLabel(title: string): string {
  return title.split(' — ')[1] ?? title;
}

export const METRIC_META: Record<string, StatMetricMeta> = {
  goalsPer90: {
    label: 'Goals per 90',
    description: 'Goals per 90 minutes',
    formatKind: 'decimal',
  },
  xGPer90: {
    label: 'xG per 90',
    description: 'Expected goals per 90 minutes',
    formatKind: 'decimal',
  },
  shotAccuracyPct: {
    label: 'Shot accuracy %',
    description: 'Share of shots on target',
    formatKind: 'percentage',
  },
  conversionRatePct: {
    label: 'Conversion rate %',
    description: 'Goals per shot attempt',
    formatKind: 'percentage',
  },
  shotsOnTarget: {
    label: 'Shots on target',
    description: 'Total shots on target',
    formatKind: 'number',
  },
  touchesInBox: {
    label: 'Touches in box',
    description: 'Touches inside the penalty area',
    formatKind: 'number',
  },
  weakFootShotPct: {
    label: 'Weak foot shot %',
    description: 'Share of shots with weak foot',
    formatKind: 'percentage',
  },
  weakFootGoals: {
    label: 'Weak foot goals',
    description: 'Goals scored with weak foot',
    formatKind: 'number',
  },
  weakFootShotAccuracyPct: {
    label: 'Weak foot shot accuracy %',
    description: 'Accuracy on weak-foot shots',
    formatKind: 'percentage',
  },
  skillfulFootShotScore: {
    label: 'Skillful foot shot',
    description: 'Strong-foot shooting score',
    formatKind: 'decimal',
  },
  passAccuracyPct: {
    label: 'Pass accuracy %',
    description: 'Completed passes share',
    formatKind: 'percentage',
  },
  progressivePasses: {
    label: 'Progressive passes',
    description: 'Passes that advance the ball',
    formatKind: 'number',
  },
  keyPasses: {
    label: 'Key passes',
    description: 'Passes leading to a shot',
    formatKind: 'number',
  },
  throughBalls: {
    label: 'Through balls',
    description: 'Splitting passes into space',
    formatKind: 'number',
  },
  crossAccuracyPct: {
    label: 'Cross accuracy %',
    description: 'Successful crosses share',
    formatKind: 'percentage',
  },
  xA: {
    label: 'xA',
    description: 'Expected assists',
    formatKind: 'decimal',
  },
  weakFootPassPct: {
    label: 'Weak foot pass %',
    description: 'Share of passes with weak foot',
    formatKind: 'percentage',
  },
  weakFootPassAccuracyPct: {
    label: 'Weak foot pass accuracy %',
    description: 'Accuracy on weak-foot passes',
    formatKind: 'percentage',
  },
  progressiveWfPasses: {
    label: 'Progressive weak-foot passes',
    description: 'Progressive passes with weak foot',
    formatKind: 'number',
  },
  skillfulFootPassScore: {
    label: 'Skillful foot pass',
    description: 'Strong-foot passing score',
    formatKind: 'decimal',
  },
  physicalDuelsWonPct: {
    label: 'Physical duels won %',
    description: 'Share of physical duels won',
    formatKind: 'percentage',
  },
  strengthDuels: {
    label: 'Strength duels',
    description: 'Strength-based duels contested',
    formatKind: 'number',
  },
  balance: {
    label: 'Balance',
    description: 'Balance rating',
    formatKind: 'decimal',
  },
  stamina: {
    label: 'Stamina',
    description: 'Stamina rating',
    formatKind: 'decimal',
  },
  bodyContactSuccessPct: {
    label: 'Body contact success %',
    description: 'Successful body contacts share',
    formatKind: 'percentage',
  },
  tacklesWonPct: {
    label: 'Tackles won %',
    description: 'Share of tackles won',
    formatKind: 'percentage',
  },
  interceptions: {
    label: 'Interceptions',
    description: 'Passes intercepted',
    formatKind: 'number',
  },
  recoveries: {
    label: 'Recoveries',
    description: 'Ball recoveries',
    formatKind: 'number',
  },
  blocks: {
    label: 'Blocks',
    description: 'Shots or passes blocked',
    formatKind: 'number',
  },
  aerialDuelsWonPct: {
    label: 'Aerial duels won %',
    description: 'Share of aerial duels won',
    formatKind: 'percentage',
  },
  clearances: {
    label: 'Clearances',
    description: 'Defensive clearances',
    formatKind: 'number',
  },
  topSpeed: {
    label: 'Top speed',
    description: 'Maximum speed (km/h)',
    formatKind: 'decimal',
  },
  sprintDistance: {
    label: 'Sprint distance',
    description: 'Distance covered sprinting (m)',
    formatKind: 'number',
  },
  accelerations: {
    label: 'Accelerations',
    description: 'High-intensity accelerations',
    formatKind: 'number',
  },
  progressiveRuns: {
    label: 'Progressive runs',
    description: 'Ball carries into advanced zones',
    formatKind: 'number',
  },
  distanceCovered: {
    label: 'Distance covered',
    description: 'Total distance (km)',
    formatKind: 'decimal',
  },
  dribblesAttempted: {
    label: 'Dribbles attempted',
    description: 'Attempted take-ons',
    formatKind: 'number',
  },
  dribbleSuccessPct: {
    label: 'Dribble success %',
    description: 'Successful dribbles share',
    formatKind: 'percentage',
  },
  progressiveCarries: {
    label: 'Progressive carries',
    description: 'Carries that advance the ball',
    formatKind: 'decimal',
  },
  carriesIntoFinalThird: {
    label: 'Carries into final third',
    description: 'Entries into the attacking third',
    formatKind: 'decimal',
  },
  ballRetentionPct: {
    label: 'Ball retention %',
    description: 'Possession retained under pressure',
    formatKind: 'percentage',
  },
  foulsWon: {
    label: 'Fouls won',
    description: 'Fouls drawn',
    formatKind: 'decimal',
  },
};

export function formatValue(
  value: number | null | undefined,
  formatKind: StatFormatKind,
): string {
  if (value === null || value === undefined) return '—';
  if (formatKind === 'decimal') return value.toFixed(1);
  if (formatKind === 'percentage') return `${value.toFixed(1)}%`;
  return String(value);
}

function normalize(value: number, max: number): number {
  return Math.min(100, Math.round((value / max) * 100));
}

export type RadarScore = { category: string; score: number };

export function computeRadarScores(stats: PlayerDetailStats): RadarScore[] {
  const avg = (vals: (number | null | undefined)[]): number => {
    const filtered = vals.filter((v): v is number => v !== null && v !== undefined);
    if (filtered.length === 0) return 0;
    return filtered.reduce((a, b) => a + b, 0) / filtered.length;
  };

  return [
    {
      category: 'SHO',
      score: Math.round(
        avg([
          stats.skillfulFootShotScore !== null
            ? (stats.skillfulFootShotScore ?? 0) * 10
            : null,
          stats.shotAccuracyPct,
          stats.conversionRatePct,
          stats.xGPer90 !== null ? normalize(stats.xGPer90 ?? 0, 1.5) : null,
        ]),
      ),
    },
    {
      category: 'PAS',
      score: Math.round(
        avg([
          stats.skillfulFootPassScore !== null
            ? (stats.skillfulFootPassScore ?? 0) * 10
            : null,
          stats.passAccuracyPct,
          stats.crossAccuracyPct,
        ]),
      ),
    },
    {
      category: 'PHY',
      score: Math.round(
        avg([
          stats.physicalDuelsWonPct,
          stats.balance !== null ? (stats.balance ?? 0) * 10 : null,
          stats.stamina !== null ? (stats.stamina ?? 0) * 10 : null,
          stats.bodyContactSuccessPct,
        ]),
      ),
    },
    {
      category: 'DEF',
      score: Math.round(
        avg([
          stats.tacklesWonPct,
          stats.aerialDuelsWonPct,
          stats.interceptions !== null ? normalize(stats.interceptions ?? 0, 80) : null,
        ]),
      ),
    },
    {
      category: 'PAC',
      score: Math.round(
        avg([
          stats.topSpeed !== null ? normalize(stats.topSpeed ?? 0, 38) : null,
          stats.distanceCovered !== null ? normalize(stats.distanceCovered ?? 0, 12) : null,
          stats.accelerations !== null ? normalize(stats.accelerations ?? 0, 300) : null,
        ]),
      ),
    },
    {
      category: 'DRI',
      score: Math.round(
        avg([
          stats.dribbleSuccessPct,
          stats.ballRetentionPct,
          stats.progressiveCarries !== null
            ? normalize(stats.progressiveCarries ?? 0, 100)
            : null,
        ]),
      ),
    },
  ];
}

export function clientToSvgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const p = svg.createSVGPoint();
  p.x = clientX;
  p.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const t = p.matrixTransform(ctm.inverse());
  return { x: t.x, y: t.y };
}

function normalizeAngle(rad: number) {
  let a = rad;
  while (a <= -Math.PI) a += 2 * Math.PI;
  while (a > Math.PI) a -= 2 * Math.PI;
  return a;
}

function angleDiff(a: number, b: number) {
  return Math.abs(normalizeAngle(a - b));
}

export function pickCategoryByNearestAxis(
  pole: { x: number; y: number },
  vertices: { x: number; y: number; category: string }[],
  mouse: { x: number; y: number },
  maxRadius: number,
): string | null {
  if (vertices.length === 0) return null;
  const effectiveMax = Math.max(maxRadius, 1);
  const dx = mouse.x - pole.x;
  const dy = mouse.y - pole.y;
  const dist = Math.hypot(dx, dy);
  if (dist > effectiveMax * 1.4) return null;

  const mouseAngle = Math.atan2(dy, dx);
  let best = vertices[0]?.category ?? null;
  let bestDiff = Infinity;
  for (const v of vertices) {
    const va = Math.atan2(v.y - pole.y, v.x - pole.x);
    const d = angleDiff(mouseAngle, va);
    if (d < bestDiff) {
      bestDiff = d;
      best = v.category;
    }
  }
  return best;
}

export const POSITION_FULL: Record<string, string> = {
  GK: 'Goalkeeper',
  CB: 'Center Back',
  RB: 'Right Back',
  LB: 'Left Back',
  RWB: 'Right Wing Back',
  LWB: 'Left Wing Back',
  CDM: 'Defensive Midfielder',
  CM: 'Central Midfielder',
  CAM: 'Attacking Midfielder',
  RM: 'Right Midfielder',
  LM: 'Left Midfielder',
  RW: 'Right Winger',
  LW: 'Left Winger',
  ST: 'Striker',
  CF: 'Center Forward',
  SS: 'Second Striker',
};
