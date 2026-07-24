import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

const KEYS = {
  AVAILABILITY: (paramsHash: string) => `transfer:availability:${paramsHash}`,
  // AI asistanı için kısa optionId → HotelBeds transfer rateKey + bağlam.
  RATE_OPTION: (token: string) => `transfer:rate-option:${token}`,
};

@Injectable()
export class TransferCacheService {
  private readonly availabilityTtl = DateTimeManager.toSeconds({ minutes: 10 });
  private readonly rateOptionTtl = DateTimeManager.toSeconds({ minutes: 15 });

  constructor(@InjectRedis() private readonly redis: Redis) {}

  get transferAvailability() {
    return {
      get: async <T = unknown>(paramsHash: string): Promise<T | null> => {
        const raw = await this.redis.get(KEYS.AVAILABILITY(paramsHash));
        if (!raw) return null;
        try {
          return JSON.parse(raw) as T;
        } catch {
          return null;
        }
      },
      set: async <T = unknown>(paramsHash: string, data: T): Promise<void> => {
        await this.redis.set(
          KEYS.AVAILABILITY(paramsHash),
          JSON.stringify(data),
          'EX',
          this.availabilityTtl
        );
      },
    };
  }

  get transferRateOption() {
    return {
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
      get: async <T = unknown>(token: string): Promise<T | null> => {
        const raw = await this.redis.get(KEYS.RATE_OPTION(token));
        if (!raw) return null;
        try {
          return JSON.parse(raw) as T;
        } catch {
          return null;
        }
      },
    };
  }
}
