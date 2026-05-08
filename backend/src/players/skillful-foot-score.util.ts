export function pctToZeroTenScale(
  pct: number | null | undefined,
): number | null {
  if (pct == null || Number.isNaN(pct)) return null;
  const clamped = Math.min(100, Math.max(0, pct));
  return Math.round((clamped / 10) * 10) / 10;
}
