export const DEFAULT_PLAYERS_PAGE = 1;

export const PLAYERS_FIXED_PAGE_SIZE = 10;

export const PLAYER_POSITION_VALUES = [
  'GK',
  'RB',
  'RWB',
  'CB',
  'LB',
  'LWB',
  'CDM',
  'CM',
  'CAM',
  'RW',
  'RM',
  'LW',
  'LM',
  'ST',
  'CF',
  'SS',
] as const;

export type PlayersListRouteState = {
  search?: string;
  position?: string;
  nationality?: string;
  minAge?: number;
  maxAge?: number;
  page: number;
  pageSize: number;
};

export function firstSearchParamValue(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  if (v === undefined || v === '') return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export function parsePlayerListSearchParams(
  sp: Record<string, string | string[] | undefined>,
): PlayersListRouteState {
  const pageRaw = firstSearchParamValue(sp, 'page');
  let page = parseInt(pageRaw ?? '', 10);
  if (!Number.isFinite(page) || page < 1) page = DEFAULT_PLAYERS_PAGE;

  const search = firstSearchParamValue(sp, 'search')?.trim();
  const position = firstSearchParamValue(sp, 'position')?.trim();
  const nationality = firstSearchParamValue(sp, 'nationality')?.trim();

  const minAgeRaw = firstSearchParamValue(sp, 'minAge');
  const maxAgeRaw = firstSearchParamValue(sp, 'maxAge');
  const minAge = minAgeRaw !== undefined ? parseInt(minAgeRaw, 10) : undefined;
  const maxAge = maxAgeRaw !== undefined ? parseInt(maxAgeRaw, 10) : undefined;

  return {
    ...(search ? { search } : {}),
    ...(position ? { position } : {}),
    ...(nationality ? { nationality } : {}),
    ...(minAge !== undefined && Number.isFinite(minAge) && minAge >= 0 ? { minAge } : {}),
    ...(maxAge !== undefined && Number.isFinite(maxAge) && maxAge >= 0 ? { maxAge } : {}),
    page,
    pageSize: PLAYERS_FIXED_PAGE_SIZE,
  };
}

export function serializePlayersListToPathQuery(state: PlayersListRouteState): string {
  const p = new URLSearchParams();
  if (state.search) p.set('search', state.search);
  if (state.position) p.set('position', state.position);
  if (state.nationality) p.set('nationality', state.nationality);
  if (state.minAge !== undefined) p.set('minAge', String(state.minAge));
  if (state.maxAge !== undefined) p.set('maxAge', String(state.maxAge));
  if (state.page !== DEFAULT_PLAYERS_PAGE) p.set('page', String(state.page));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export function playersListHrefForState(state: PlayersListRouteState): string {
  return `/players${serializePlayersListToPathQuery(state)}`;
}
