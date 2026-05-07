import { getPlayers } from '@/lib/players-api';
import PlayersGridClient from './players-grid-client';

export default async function PlayersGrid() {
  const players = await getPlayers();
  return <PlayersGridClient players={players} />;
}
