import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { INotificationCacheService } from '@modules/platform/notification/domain/interfaces/notification-cache.service.interface';

const SSE_TICKET_TTL_SECONDS = 30;

const KEYS = {
  SSE_TICKET: (ticket: string) => `notification:sse-ticket:${ticket}`,
};

@Injectable()
export class NotificationCacheService implements INotificationCacheService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  get sseTicket() {
    return {
      /** SSE stream açmak için tek-kullanımlık kısa ömürlü bilet üretir (ticket → userId). */
      set: async (ticket: string, userId: string) => {
        await this.redis.set(
          KEYS.SSE_TICKET(ticket),
          userId,
          'EX',
          SSE_TICKET_TTL_SECONDS
        );
      },

      /** Bileti atomik olarak okur + siler (tek kullanımlık); geçersizse null. */
      consume: (ticket: string) => this.redis.getdel(KEYS.SSE_TICKET(ticket)),
    };
  }
}
