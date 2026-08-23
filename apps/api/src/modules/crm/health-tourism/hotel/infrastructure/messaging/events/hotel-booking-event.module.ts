import { Module } from '@nestjs/common';
import { AuditLogModule } from '@modules/platform/audit-log/audit-log.module';
import { HotelBookingListener } from './listeners';

/**
 * Publisher yok: otel rezervasyon event'leri entity içinde `addDomainEvent` ile
 * raise ediliyor ve repo `create()`/`update()` içinde flush ediliyor. Bu modül
 * yalnız dinleyiciyi ayağa kaldırır.
 */
@Module({
  imports: [AuditLogModule],
  providers: [HotelBookingListener],
})
export class HotelBookingEventModule {}
