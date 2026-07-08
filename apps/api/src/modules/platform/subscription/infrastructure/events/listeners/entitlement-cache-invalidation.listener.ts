import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from '@src/infrastructure/cache/redis/redis.service';
import { SubscriptionActivatedEvent } from '@modules/platform/subscription/domain/events/subscription-activated.event';
import { SubscriptionRenewedEvent } from '@modules/platform/subscription/domain/events/subscription-renewed.event';
import { ModuleAddedEvent } from '@modules/platform/subscription/domain/events/module-added.event';

/**
 * Abonelik değiştiğinde (aktivasyon / yenileme / modül ekleme) kiracının entitlement cache'ini
 * bust eder — böylece satın alınan modül/plan bir sonraki istekte anında yansır. Outbox relay
 * üzerinden asenkron tetiklenir; kalıcı sızıntıyı cache TTL'i de kapatır.
 */
@Injectable()
export class EntitlementCacheInvalidationListener {
  private readonly logger = new Logger(
    EntitlementCacheInvalidationListener.name
  );

  constructor(private readonly redis: RedisService) {}

  @OnEvent(
    [
      SubscriptionActivatedEvent.NAME,
      SubscriptionRenewedEvent.NAME,
      ModuleAddedEvent.NAME,
    ],
    { async: true }
  )
  async handle(payload: { organizationId?: string }): Promise<void> {
    if (!payload?.organizationId) return;
    try {
      await this.redis.deleteTenantEntitlementsByOrg(payload.organizationId);
    } catch (err) {
      this.logger.error(
        `Entitlement cache bust hatası (organizationId: ${payload.organizationId})`,
        err
      );
    }
  }
}
