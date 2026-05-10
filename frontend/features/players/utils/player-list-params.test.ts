import {
  DEFAULT_PLAYERS_PAGE,
  PLAYERS_FIXED_PAGE_SIZE,
  firstSearchParamValue,
  parsePlayerListSearchParams,
  playersListHrefForState,
  serializePlayersListApiQuery,
  serializePlayersListToPathQuery,
  shortlistListHrefForState,
} from './player-list-params';

describe('firstSearchParamValue', () => {
  it('returns undefined for missing key', () => {
    expect(firstSearchParamValue({}, 'search')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(firstSearchParamValue({ search: '' }, 'search')).toBeUndefined();
  });

  it('returns the value when string', () => {
    expect(firstSearchParamValue({ search: 'messi' }, 'search')).toBe('messi');
  });

  it('returns the first item when array', () => {
    expect(firstSearchParamValue({ search: ['a', 'b'] }, 'search')).toBe('a');
  });
});

describe('parsePlayerListSearchParams', () => {
  it('returns defaults when no params are provided', () => {
    expect(parsePlayerListSearchParams({})).toEqual({
      page: DEFAULT_PLAYERS_PAGE,
      pageSize: PLAYERS_FIXED_PAGE_SIZE,
    });
  });

  it('parses valid filters and trims strings', () => {
    const state = parsePlayerListSearchParams({
      search: '  Messi ',
      position: ' ST ',
      nationality: ' Argentina ',
      minAge: '18',
      maxAge: '35',
      page: '3',
    });

    expect(state).toEqual({
      search: 'Messi',
      position: 'ST',
      nationality: 'Argentina',
      minAge: 18,
      maxAge: 35,
      page: 3,
      pageSize: PLAYERS_FIXED_PAGE_SIZE,
    });
  });

  it('falls back to default page when invalid or below 1', () => {
    expect(parsePlayerListSearchParams({ page: 'abc' }).page).toBe(DEFAULT_PLAYERS_PAGE);
    expect(parsePlayerListSearchParams({ page: '0' }).page).toBe(DEFAULT_PLAYERS_PAGE);
    expect(parsePlayerListSearchParams({ page: '-5' }).page).toBe(DEFAULT_PLAYERS_PAGE);
  });

  it('ignores empty strings as if not provided', () => {
    const state = parsePlayerListSearchParams({
      search: '',
      position: '',
      nationality: '',
    });
    expect(state).toEqual({
      page: DEFAULT_PLAYERS_PAGE,
      pageSize: PLAYERS_FIXED_PAGE_SIZE,
    });
  });

  it('drops negative ages', () => {
    const state = parsePlayerListSearchParams({ minAge: '-1', maxAge: '-2' });
    expect(state.minAge).toBeUndefined();
    expect(state.maxAge).toBeUndefined();
  });

  it('drops non-numeric ages', () => {
    const state = parsePlayerListSearchParams({ minAge: 'abc' });
    expect(state.minAge).toBeUndefined();
  });

  it('keeps only the first value when array provided', () => {
    const state = parsePlayerListSearchParams({ search: ['Messi', 'Other'] });
    expect(state.search).toBe('Messi');
  });
});

describe('serializePlayersListToPathQuery', () => {
  it('returns empty string for default state', () => {
    expect(
      serializePlayersListToPathQuery({
        page: DEFAULT_PLAYERS_PAGE,
        pageSize: PLAYERS_FIXED_PAGE_SIZE,
      }),
    ).toBe('');
  });

  it('omits page param when on default page', () => {
    const qs = serializePlayersListToPathQuery({
      search: 'Messi',
      page: DEFAULT_PLAYERS_PAGE,
      pageSize: PLAYERS_FIXED_PAGE_SIZE,
    });
    expect(qs).toBe('?search=Messi');
  });

  it('includes page when not default', () => {
    const qs = serializePlayersListToPathQuery({
      page: 4,
      pageSize: PLAYERS_FIXED_PAGE_SIZE,
    });
    expect(qs).toBe('?page=4');
  });

  it('serializes all known fields', () => {
    const qs = serializePlayersListToPathQuery({
      search: 'a',
      position: 'ST',
      nationality: 'Argentina',
      minAge: 20,
      maxAge: 30,
      page: 2,
      pageSize: PLAYERS_FIXED_PAGE_SIZE,
    });
    const params = new URLSearchParams(qs.replace(/^\?/, ''));
    expect(params.get('search')).toBe('a');
    expect(params.get('position')).toBe('ST');
    expect(params.get('nationality')).toBe('Argentina');
    expect(params.get('minAge')).toBe('20');
    expect(params.get('maxAge')).toBe('30');
    expect(params.get('page')).toBe('2');
  });
});

describe('serializePlayersListApiQuery', () => {
  it('always includes page and pageSize', () => {
    const qs = serializePlayersListApiQuery({
      page: DEFAULT_PLAYERS_PAGE,
      pageSize: PLAYERS_FIXED_PAGE_SIZE,
    });
    const params = new URLSearchParams(qs);
    expect(params.get('page')).toBe(String(DEFAULT_PLAYERS_PAGE));
    expect(params.get('pageSize')).toBe(String(PLAYERS_FIXED_PAGE_SIZE));
  });

  it('skips undefined fields', () => {
    const qs = serializePlayersListApiQuery({
      page: 1,
      pageSize: 10,
    });
    expect(qs).not.toContain('search=');
    expect(qs).not.toContain('minAge=');
  });

  it('roundtrips: parse → serialize → parse', () => {
    const original = {
      search: 'foo',
      position: 'CM',
      nationality: 'Brazil',
      minAge: 18,
      maxAge: 33,
      page: 2,
      pageSize: PLAYERS_FIXED_PAGE_SIZE,
    };
    const qs = serializePlayersListToPathQuery(original);
    const params: Record<string, string> = {};
    new URLSearchParams(qs.replace(/^\?/, '')).forEach((v, k) => {
      params[k] = v;
    });
    expect(parsePlayerListSearchParams(params)).toEqual(original);
  });
});

describe('href builders', () => {
  it('builds players list href', () => {
    expect(
      playersListHrefForState({
        page: DEFAULT_PLAYERS_PAGE,
        pageSize: PLAYERS_FIXED_PAGE_SIZE,
      }),
    ).toBe('/players');

    expect(
      playersListHrefForState({
        search: 'a',
        page: DEFAULT_PLAYERS_PAGE,
        pageSize: PLAYERS_FIXED_PAGE_SIZE,
      }),
    ).toBe('/players?search=a');
  });

  it('builds shortlist href', () => {
    expect(
      shortlistListHrefForState({
        page: 2,
        pageSize: PLAYERS_FIXED_PAGE_SIZE,
      }),
    ).toBe('/players/shortlist?page=2');
  });
});
