import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

const KEYS = {
  RATE_OPTION: (token: string) => `hotel:rate-option:${token}`,
};

@Injectable()
export class HotelCacheService {
  private readonly rateOptionTtl = DateTimeManager.toSeconds({
    minutes: 15,
  });

  constructor(@InjectRedis() private readonly redis: Redis) {}

  get hotelRateOption() {
    return {
      get: async <T = unknown>(token: string): Promise<T | null> => {
        const raw = await this.redis.get(KEYS.RATE_OPTION(token));
        if (!raw) return null;

        try {
          return JSON.parse(raw) as T;
        } catch {
          return null;
        }
      },

      set: async <T = unknown>(
        token: string,
        data: T,
        ttlSeconds = this.rateOptionTtl
      ): Promise<void> => {
        await this.redis.set(
          KEYS.RATE_OPTION(token),
          JSON.stringify(data),
          'EX',
          ttlSeconds
        );
      },
    };
  }
}
