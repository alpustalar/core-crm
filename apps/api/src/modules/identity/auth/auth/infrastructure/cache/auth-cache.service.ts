import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ActorContext } from '@common/interfaces';
import {
  ACTOR_CONTEXT_CACHE_TTL_SECONDS,
  AUTH_CACHE_KEYS,
  hashAuthToken,
} from '@src/auth';

// Anahtarlar ve TTL çekirdekten gelir — bu cache'i `apps/messaging` de okuyacak.
// Burada yeniden tanımlansalardı iki süreç sessizce ayrışabilirdi (bkz. auth-cache.keys.ts).
const KEYS = {
  ACTOR_CACHE: AUTH_CACHE_KEYS.actorContext,
  TOKEN_BLOCKLIST: AUTH_CACHE_KEYS.tokenBlocklist,
};

@Injectable()
export class AuthCacheService {
  private readonly actorCacheTtl = ACTOR_CONTEXT_CACHE_TTL_SECONDS;

  constructor(@InjectRedis() private readonly redis: Redis) {}

  get token() {
    return {
      block: async (rawToken: string, ttlSeconds: number): Promise<void> => {
        if (ttlSeconds <= 0) return;
        const hash = this.hashToken(rawToken);
        await this.redis.set(KEYS.TOKEN_BLOCKLIST(hash), '1', 'EX', ttlSeconds);
      },

      isBlocked: async (rawToken: string): Promise<boolean> => {
        const hash = this.hashToken(rawToken);
        const result = await this.redis.get(KEYS.TOKEN_BLOCKLIST(hash));
        return result !== null;
      },
    };
  }

  get actorContext() {
    return {
      set: async <T = ActorContext>(
        userId: string,
        actor: T
      ): Promise<void> => {
        await this.redis.set(
          KEYS.ACTOR_CACHE(userId),
          JSON.stringify(actor),
          'EX',
          this.actorCacheTtl
        );
      },

      get: async <T = ActorContext>(userId: string): Promise<T | null> => {
        const raw = await this.redis.get(KEYS.ACTOR_CACHE(userId));
        if (!raw) return null;

        try {
          return JSON.parse(raw) as T;
        } catch {
          return null;
        }
      },

      del: async (userId: string): Promise<number> => {
        return this.redis.del(KEYS.ACTOR_CACHE(userId));
      },

      deleteMany: async (userIds: string[]): Promise<void> => {
        if (!userIds || userIds.length === 0) return;

        const keys = userIds.map((id) => KEYS.ACTOR_CACHE(id));

        await this.redis.unlink(...keys);
      },
    };
  }

  private hashToken(rawToken: string): string {
    return hashAuthToken(rawToken);
  }
}
