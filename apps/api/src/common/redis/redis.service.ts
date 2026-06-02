import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ActorContext } from '@common/interfaces';
import { REDIS_KEYS } from './constants';

const ACTOR_CACHE_TTL_SECONDS = 300;

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  // ─── Meta Ads ─────────────────────────────────────────────────────────────

  async setMetaOAuthState(state: string, payload: string): Promise<void> {
    await this.redis.set(
      REDIS_KEYS.META_ADS.OAUTH_STATE(state),
      payload,
      'EX',
      600,
    );
  }

  async getMetaOAuthState(state: string): Promise<string | null> {
    return this.redis.get(REDIS_KEYS.META_ADS.OAUTH_STATE(state));
  }

  async deleteMetaOAuthState(state: string): Promise<void> {
    await this.redis.del(REDIS_KEYS.META_ADS.OAUTH_STATE(state));
  }

  // ─── Auth: Actor Context Cache ────────────────────────────────────────────

  async setActorContext(userId: string, actor: ActorContext): Promise<void> {
    await this.redis.set(
      REDIS_KEYS.AUTH.ACTOR_CACHE(userId),
      JSON.stringify(actor),
      'EX',
      ACTOR_CACHE_TTL_SECONDS,
    );
  }

  async getActorContext(userId: string): Promise<ActorContext | null> {
    const raw = await this.redis.get(REDIS_KEYS.AUTH.ACTOR_CACHE(userId));
    return raw ? (JSON.parse(raw) as ActorContext) : null;
  }

  async deleteActorContext(userId: string): Promise<void> {
    await this.redis.del(REDIS_KEYS.AUTH.ACTOR_CACHE(userId));
  }

  async deleteManyActorContexts(userIds: string[]): Promise<void> {
    if (userIds.length === 0) return;
    const keys = userIds.map((id) => REDIS_KEYS.AUTH.ACTOR_CACHE(id));
    await this.redis.unlink(...keys);
  }

  // ─── Auth: Token Blocklist ────────────────────────────────────────────────

  async blockToken(rawToken: string, ttlSeconds: number): Promise<void> {
    const hash = createHash('sha256').update(rawToken).digest('hex');
    await this.redis.set(
      REDIS_KEYS.AUTH.TOKEN_BLOCKLIST(hash),
      '1',
      'EX',
      ttlSeconds,
    );
  }

  async isTokenBlocked(rawToken: string): Promise<boolean> {
    const hash = createHash('sha256').update(rawToken).digest('hex');
    const result = await this.redis.get(REDIS_KEYS.AUTH.TOKEN_BLOCKLIST(hash));
    return result !== null;
  }
}
