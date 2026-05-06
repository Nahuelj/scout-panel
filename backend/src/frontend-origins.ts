export function getFrontendOrigins(): string[] {
  const primary = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  const origins = new Set<string>([primary]);
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
  }
  return [...origins];
}
