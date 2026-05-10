import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ShortlistService } from './shortlist.service';

const mockPrisma = {
  player: {
    findUnique: jest.fn(),
  },
  shortlistEntry: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockPlayersListReadService = {
  findShortlistedForUser: jest.fn(),
};

function makeService() {
  return new ShortlistService(
    mockPrisma as any,
    mockPlayersListReadService as any,
  );
}

describe('ShortlistService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('add', () => {
    describe('when the player does not exist', () => {
      it('should throw NotFoundException', async () => {
        mockPrisma.player.findUnique.mockResolvedValue(null);
        const service = makeService();

        await expect(service.add('user-1', 'player-999')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('when the player exists', () => {
      beforeEach(() => {
        mockPrisma.player.findUnique.mockResolvedValue({ id: 'player-1' });
        mockPrisma.$transaction.mockImplementation(
          (fn: (tx: typeof mockPrisma) => Promise<void>) => fn(mockPrisma),
        );
      });

      it('should do nothing when the entry already exists', async () => {
        mockPrisma.shortlistEntry.findUnique.mockResolvedValue({ id: 'entry-1' });
        const service = makeService();

        await service.add('user-1', 'player-1');

        expect(mockPrisma.shortlistEntry.create).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException when the shortlist is full', async () => {
        mockPrisma.shortlistEntry.findUnique.mockResolvedValue(null);
        mockPrisma.shortlistEntry.count.mockResolvedValue(200);
        const service = makeService();

        await expect(service.add('user-1', 'player-1')).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should create the entry when the player is not in the shortlist and limit is not reached', async () => {
        mockPrisma.shortlistEntry.findUnique.mockResolvedValue(null);
        mockPrisma.shortlistEntry.count.mockResolvedValue(5);
        mockPrisma.shortlistEntry.create.mockResolvedValue({});
        const service = makeService();

        await service.add('user-1', 'player-1');

        expect(mockPrisma.shortlistEntry.create).toHaveBeenCalledWith({
          data: { userId: 'user-1', playerId: 'player-1' },
        });
      });

      it('should swallow a P2002 unique constraint error', async () => {
        mockPrisma.shortlistEntry.findUnique.mockResolvedValue(null);
        mockPrisma.shortlistEntry.count.mockResolvedValue(5);
        const p2002 = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '0',
        });
        mockPrisma.$transaction.mockRejectedValue(p2002);
        const service = makeService();

        await expect(service.add('user-1', 'player-1')).resolves.toBeUndefined();
      });

      it('should rethrow unknown errors', async () => {
        const unknownError = new Error('DB connection lost');
        mockPrisma.$transaction.mockRejectedValue(unknownError);
        const service = makeService();

        await expect(service.add('user-1', 'player-1')).rejects.toThrow(
          'DB connection lost',
        );
      });
    });
  });

  describe('remove', () => {
    it('should call deleteMany with the correct userId and playerId', async () => {
      mockPrisma.shortlistEntry.deleteMany.mockResolvedValue({ count: 1 });
      const service = makeService();

      await service.remove('user-1', 'player-1');

      expect(mockPrisma.shortlistEntry.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', playerId: 'player-1' },
      });
    });
  });

  describe('playerIdsForUser', () => {
    it('should return the player ids ordered by createdAt desc', async () => {
      mockPrisma.shortlistEntry.findMany.mockResolvedValue([
        { playerId: 'player-2' },
        { playerId: 'player-1' },
      ]);
      const service = makeService();

      const result = await service.playerIdsForUser('user-1');

      expect(result).toEqual(['player-2', 'player-1']);
    });

    it('should return an empty array when the shortlist is empty', async () => {
      mockPrisma.shortlistEntry.findMany.mockResolvedValue([]);
      const service = makeService();

      const result = await service.playerIdsForUser('user-1');

      expect(result).toEqual([]);
    });
  });
});
