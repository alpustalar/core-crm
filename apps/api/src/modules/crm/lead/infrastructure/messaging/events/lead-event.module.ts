import { Module } from '@nestjs/common';
import { AuditLogModule } from '@modules/platform/audit-log/audit-log.module';
import {
  LeadConvertedListener,
  LeadCreatedListener,
  LeadLostListener,
  LeadStatusChangedListener,
} from './listeners';
import { ContextModule } from '@src/infrastructure/context/context.module';

export const LEAD_LISTENERS = [
  LeadCreatedListener,
  LeadStatusChangedListener,
  LeadConvertedListener,
  LeadLostListener,
];

@Module({
  imports: [AuditLogModule, ContextModule],
  // Publisher yok: lead event'lerinin tamamı entity içinde `addDomainEvent` ile
  // raise ediliyor ve repo `update()`/`create()` içinde flush ediliyor. Bu modül
  // yalnız dinleyicileri (audit log) ayağa kaldırır.
  providers: LEAD_LISTENERS,
})
export class LeadEventModule {}
