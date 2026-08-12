import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { HealthIndicator } from '@src/http';

/**
 * Redis erişilebilir mi. `status` alanına bakmak yetmez — bağlantı "ready"
 * görünürken sunucu yanıt vermiyor olabilir; bu yüzden gerçekten PING atılır.
 */
@Injectable()
export class RedisHealthIndicator implements HealthIndicator {
  readonly name = 'redis';

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async isHealthy(): Promise<boolean> {
    const pong = await this.redis.ping();
    return pong === 'PONG';
  }
}
