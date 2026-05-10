export const AUTH_ROUTES = ['/login', '/register'] as const;

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  players: '/players',
  shortlist: '/players/shortlist',
  compare: '/compare',
  playerDetail: (id: string) => `/players/${id}`,
} as const;
