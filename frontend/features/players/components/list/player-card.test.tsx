import { fireEvent, render, screen } from '@testing-library/react';
import type { PlayerCardData } from '@/features/players/types/player.types';
import PlayerCard from './player-card';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

function makePlayer(overrides: Partial<PlayerCardData> = {}): PlayerCardData {
  return {
    id: 'p1',
    name: 'Lionel Messi',
    photoUrl: null,
    position: 'RW',
    nationality: 'Argentina',
    birthDate: '1987-06-24',
    currentSeason: {
      club: 'Inter Miami',
      clubLogoUrl: null,
      league: 'MLS',
      stats: {
        matchesPlayed: 30,
        goals: 25,
        assists: 12,
        xGPer90: 0.85,
      },
    },
    ...overrides,
  };
}

describe('PlayerCard', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renders the player name, nationality and stats', () => {
    render(
      <PlayerCard player={makePlayer()} isSelected={false} onToggle={() => {}} />,
    );

    expect(screen.getByText('Lionel Messi')).toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('0.85')).toBeInTheDocument();
  });

  it('maps the position into a group label (RW → FWD)', () => {
    render(
      <PlayerCard player={makePlayer({ position: 'RW' })} isSelected={false} onToggle={() => {}} />,
    );
    expect(screen.getByText('FWD')).toBeInTheDocument();
  });

  it('renders fallback dash when xGPer90 is null', () => {
    const player = makePlayer({
      currentSeason: {
        club: 'X',
        clubLogoUrl: null,
        league: null,
        stats: { matchesPlayed: 1, goals: 0, assists: 0, xGPer90: null },
      },
    });
    render(<PlayerCard player={player} isSelected={false} onToggle={() => {}} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('calls onToggle when behavior is "compare" (default)', () => {
    const onToggle = jest.fn();
    render(<PlayerCard player={makePlayer()} isSelected={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByText('Lionel Messi'));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('navigates to detail page when behavior is "openDetail"', () => {
    const onToggle = jest.fn();
    render(
      <PlayerCard
        player={makePlayer({ id: 'abc-123' })}
        isSelected={false}
        onToggle={onToggle}
        cardBehavior="openDetail"
      />,
    );

    fireEvent.click(screen.getByText('Lionel Messi'));

    expect(pushMock).toHaveBeenCalledWith('/players/abc-123');
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('renders shortlist toggle button only when handler is provided', () => {
    const { rerender } = render(
      <PlayerCard player={makePlayer()} isSelected={false} onToggle={() => {}} />,
    );
    expect(screen.queryByLabelText(/shortlist/i)).not.toBeInTheDocument();

    rerender(
      <PlayerCard
        player={makePlayer()}
        isSelected={false}
        onToggle={() => {}}
        onShortlistToggle={() => {}}
        isShortlisted={false}
      />,
    );
    expect(screen.getByLabelText('Add to shortlist')).toBeInTheDocument();
  });

  it('shows the correct shortlist label depending on isShortlisted', () => {
    render(
      <PlayerCard
        player={makePlayer()}
        isSelected={false}
        onToggle={() => {}}
        onShortlistToggle={() => {}}
        isShortlisted
      />,
    );
    expect(screen.getByLabelText('Remove from shortlist')).toBeInTheDocument();
  });

  it('shortlist button click does not bubble up to card click', () => {
    const onToggle = jest.fn();
    const onShortlistToggle = jest.fn();
    render(
      <PlayerCard
        player={makePlayer()}
        isSelected={false}
        onToggle={onToggle}
        onShortlistToggle={onShortlistToggle}
      />,
    );

    fireEvent.click(screen.getByLabelText('Add to shortlist'));

    expect(onShortlistToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });
});
