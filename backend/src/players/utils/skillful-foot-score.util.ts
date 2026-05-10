/**
 * Converts a percentage (0–100) to a 0–10 scale.
 * Values outside range are clamped. Returns null for null, undefined, or NaN.
 */
export function pctToZeroTenScale(
  pct: number | null | undefined,
): number | null {
  if (pct == null || Number.isNaN(pct)) return null;
  const clamped = Math.min(100, Math.max(0, pct));
  return Math.round((clamped / 10) * 10) / 10;
}
