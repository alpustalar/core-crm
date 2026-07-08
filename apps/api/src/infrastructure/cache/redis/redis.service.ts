import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ActorContext, TenantEntitlements } from '@common/interfaces';
import { REDIS_KEYS } from './constants';

const ACTOR_CACHE_TTL_SECONDS = 300;
const ENTITLEMENTS_CACHE_TTL_SECONDS = 300;

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  // ─── Meta Ads ─────────────────────────────────────────────────────────────

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

  // ─── Auth: Actor Context Cache ────────────────────────────────────────────

  async setActorContext(userId: string, actor: ActorContext): Promise<void> {
    await this.redis.set(
      REDIS_KEYS.AUTH.ACTOR_CACHE(userId),
      JSON.stringify(actor),
      'EX',
      ACTOR_CACHE_TTL_SECONDS
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

  // ─── Subscription: Tenant Entitlements Cache ──────────────────────────────

  async setTenantEntitlements(
    organizationId: string,
    clinicId: string | null,
    entitlements: TenantEntitlements
  ): Promise<void> {
    await this.redis.set(
      REDIS_KEYS.SUBSCRIPTION.ENTITLEMENTS(organizationId, clinicId),
      JSON.stringify(entitlements),
      'EX',
      ENTITLEMENTS_CACHE_TTL_SECONDS
    );
  }

  async getTenantEntitlements(
    organizationId: string,
    clinicId: string | null
  ): Promise<TenantEntitlements | null> {
    const raw = await this.redis.get(
      REDIS_KEYS.SUBSCRIPTION.ENTITLEMENTS(organizationId, clinicId)
    );
    return raw ? (JSON.parse(raw) as TenantEntitlements) : null;
  }

  /** Bir org'a ait tüm entitlement anahtarlarını (org + tüm klinikleri) toplu bust eder. */
  async deleteTenantEntitlementsByOrg(organizationId: string): Promise<void> {
    const pattern =
      REDIS_KEYS.SUBSCRIPTION.ENTITLEMENTS_ORG_PATTERN(organizationId);
    const stream = this.redis.scanStream({ match: pattern, count: 100 });
    const keys: string[] = [];
    for await (const batch of stream) {
      keys.push(...(batch as string[]));
    }
    if (keys.length > 0) await this.redis.unlink(...keys);
  }

  // ─── Auth: Token Blocklist ────────────────────────────────────────────────

  async blockToken(rawToken: string, ttlSeconds: number): Promise<void> {
    const hash = createHash('sha256').update(rawToken).digest('hex');
    await this.redis.set(
      REDIS_KEYS.AUTH.TOKEN_BLOCKLIST(hash),
      '1',
      'EX',
      ttlSeconds
    );
  }

  async isTokenBlocked(rawToken: string): Promise<boolean> {
    const hash = createHash('sha256').update(rawToken).digest('hex');
    const result = await this.redis.get(REDIS_KEYS.AUTH.TOKEN_BLOCKLIST(hash));
    return result !== null;
  }

  // ─── Transfer Availability Cache ──────────────────────────────────────────

  async setTransferAvailability(
    paramsHash: string,
    data: unknown
  ): Promise<void> {
    await this.redis.set(
      REDIS_KEYS.TRANSFER.AVAILABILITY(paramsHash),
      JSON.stringify(data),
      'EX',
      300
    );
  }

  async getTransferAvailability(paramsHash: string): Promise<unknown | null> {
    const raw = await this.redis.get(
      REDIS_KEYS.TRANSFER.AVAILABILITY(paramsHash)
    );
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * AI asistanı için HotelBeds rateKey + rezervasyon bağlamını kısa bir optionId altında
   * saklar (varsayılan 15 dk). LLM uzun opak rateKey'i taşımaz; book aşamasında çözülür.
   */
  async setHotelRateOption(
    token: string,
    data: unknown,
    ttlSeconds = 900
  ): Promise<void> {
    await this.redis.set(
      REDIS_KEYS.HOTEL.RATE_OPTION(token),
      JSON.stringify(data),
      'EX',
      ttlSeconds
    );
  }

  async getHotelRateOption(token: string): Promise<unknown | null> {
    const raw = await this.redis.get(REDIS_KEYS.HOTEL.RATE_OPTION(token));
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * AI asistanı için HotelBeds transfer rateKey + bağlamını kısa bir optionId altında
   * saklar (varsayılan 15 dk). book_transfer aşamasında optionId ile çözülür.
   */
  async setTransferRateOption(
    token: string,
    data: unknown,
    ttlSeconds = 900
  ): Promise<void> {
    await this.redis.set(
      REDIS_KEYS.TRANSFER.RATE_OPTION(token),
      JSON.stringify(data),
      'EX',
      ttlSeconds
    );
  }

  async getTransferRateOption(token: string): Promise<unknown | null> {
    const raw = await this.redis.get(REDIS_KEYS.TRANSFER.RATE_OPTION(token));
    return raw ? JSON.parse(raw) : null;
  }
}
