export type CompareSlotColor = {
  base: string;
  text: string;
  bg: string;
  border: string;
  ring: string;
};

export const COMPARE_SLOT_COLORS: CompareSlotColor[] = [
  {
    base: '#10b981',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    ring: 'ring-emerald-500/40',
  },
  {
    base: '#a78bfa',
    text: 'text-violet-300',
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/40',
    ring: 'ring-violet-500/40',
  },
  {
    base: '#f59e0b',
    text: 'text-amber-300',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    ring: 'ring-amber-500/40',
  },
];

export function getSlotColor(index: number): CompareSlotColor {
  return COMPARE_SLOT_COLORS[index] ?? COMPARE_SLOT_COLORS[0];
}
