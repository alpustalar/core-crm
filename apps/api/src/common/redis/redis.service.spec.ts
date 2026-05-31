import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

const mockRedis = {
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: 'default_IORedisModuleConnectionToken', useValue: mockRedis },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setActorContext', () => {
    it('calls redis.set with serialized actor and TTL', async () => {
      const actor = { userId: 'u-1' } as any;
      await service.setActorContext('u-1', actor);
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('u-1'),
        JSON.stringify(actor),
        'EX',
        300,
      );
    });
  });

  describe('getActorContext', () => {
    it('returns parsed actor when key exists', async () => {
      const actor = { userId: 'u-1' } as any;
      mockRedis.get.mockResolvedValue(JSON.stringify(actor));
      const result = await service.getActorContext('u-1');
      expect(result).toEqual(actor);
    });

    it('returns null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await service.getActorContext('u-1');
      expect(result).toBeNull();
    });
  });

  describe('deleteActorContext', () => {
    it('calls redis.del with the correct key', async () => {
      await service.deleteActorContext('u-1');
      expect(mockRedis.del).toHaveBeenCalledWith(expect.stringContaining('u-1'));
    });
  });

  describe('blockToken / isTokenBlocked', () => {
    it('blocks a token and marks it in redis', async () => {
      await service.blockToken('raw-token', 3600);
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.any(String),
        '1',
        'EX',
        3600,
      );
    });

    it('returns true when token is blocked', async () => {
      mockRedis.get.mockResolvedValue('1');
      expect(await service.isTokenBlocked('raw-token')).toBe(true);
    });

    it('returns false when token is not blocked', async () => {
      mockRedis.get.mockResolvedValue(null);
      expect(await service.isTokenBlocked('raw-token')).toBe(false);
    });

    it('uses the same hash for blockToken and isTokenBlocked', async () => {
      await service.blockToken('my-token', 60);
      const setKey = mockRedis.set.mock.calls[0][0] as string;

      mockRedis.get.mockImplementation((key: string) =>
        Promise.resolve(key === setKey ? '1' : null),
      );

      expect(await service.isTokenBlocked('my-token')).toBe(true);
      expect(await service.isTokenBlocked('other-token')).toBe(false);
    });
  });
});
