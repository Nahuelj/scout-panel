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
  league?: string;
  clubId?: string;
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
  const league = firstSearchParamValue(sp, 'league')?.trim();
  const clubId = firstSearchParamValue(sp, 'clubId')?.trim();

  return {
    ...(search ? { search } : {}),
    ...(position ? { position } : {}),
    ...(league ? { league } : {}),
    ...(clubId ? { clubId } : {}),
    page,
    pageSize: PLAYERS_FIXED_PAGE_SIZE,
  };
}

export function serializePlayersListToPathQuery(state: PlayersListRouteState): string {
  const p = new URLSearchParams();
  if (state.search) p.set('search', state.search);
  if (state.position) p.set('position', state.position);
  if (state.league) p.set('league', state.league);
  if (state.clubId) p.set('clubId', state.clubId);
  if (state.page !== DEFAULT_PLAYERS_PAGE) p.set('page', String(state.page));
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export function playersListHrefForState(state: PlayersListRouteState): string {
  return `/players${serializePlayersListToPathQuery(state)}`;
}
