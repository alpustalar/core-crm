import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { HotelRateOptionToken } from '@modules/crm/health-tourism/hotel/domain/contracts';
import { IHotelCacheService } from '@modules/crm/health-tourism/hotel/domain/interfaces/hotel-cache.service.interface';

const KEYS = {
  RATE_OPTION: (token: string) => `hotel:rate-option:${token}`,
};

@Injectable()
export class HotelCacheService implements IHotelCacheService {
  private readonly rateOptionTtl = DateTimeManager.toSeconds({
    minutes: 15,
  });

  constructor(@InjectRedis() private readonly redis: Redis) {}

  get hotelRateOption() {
    return {
      get: async (token: string): Promise<HotelRateOptionToken | null> => {
        const raw = await this.redis.get(KEYS.RATE_OPTION(token));
        if (!raw) return null;

        try {
          // Cache dışarıdan gelen bir kaynak değil; yalnız bu servisin `set`'i yazar.
          // Şema sürümü değişip eski kayıt kalırsa bozuk JSON'daki gibi `null` dönmez —
          // bu yüzden anahtar TTL'i (15 dk) sürüm kayması penceresini de kapatır.
          return JSON.parse(raw) as HotelRateOptionToken;
        } catch {
          return null;
        }
      },

      set: async (
        token: string,
        data: HotelRateOptionToken,
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
