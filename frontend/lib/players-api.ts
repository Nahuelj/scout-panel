export type PlayerCardData = {
  id: string;
  name: string;
  photoUrl: string | null;
  position: string;
  nationality: string | null;
  birthDate: string | null;
  currentSeason: {
    club: string;
    clubLogoUrl: string | null;
    league: string | null;
    stats: {
      matchesPlayed: number;
      goals: number;
      assists: number;
      xGPer90: number | null;
    } | null;
  } | null;
};

export type PlayerFilters = {
  position?: string;
  nationality?: string;
  seasonId?: string;
  clubId?: string;
  search?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function getPlayers(filters?: PlayerFilters): Promise<PlayerCardData[]> {
  const params = new URLSearchParams(
    Object.entries(filters ?? {}).filter(([, v]) => v !== undefined) as [string, string][],
  );
  const res = await fetch(`${API_URL}/players?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}
