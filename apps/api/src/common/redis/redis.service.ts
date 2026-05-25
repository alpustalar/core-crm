import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { REDIS_KEYS } from './constants';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async setMetaOAuthState(state: string, payload: string): Promise<void> {
    await this.redis.set(
      REDIS_KEYS.META_ADS.OAUTH_STATE(state),
      payload,
      'EX',
      600
    );
  }

  async getMetaOAuthState(state: string): Promise<string | null> {
    return this.redis.get(REDIS_KEYS.META_ADS.OAUTH_STATE(state));
  }

  async deleteMetaOAuthState(state: string): Promise<void> {
    await this.redis.del(REDIS_KEYS.META_ADS.OAUTH_STATE(state));
  }
}
