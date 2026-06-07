import { Module } from '@nestjs/common';
import { AuditLogModule } from '@modules/platform/audit-log/audit-log.module';
import { LEAD_EVENT_PUBLISHER } from '@modules/crm/lead/domain/interfaces/lead-event-publisher.interface';
import { LeadEventPublisher } from './lead-event-publisher.service';
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
  providers: [
    { provide: LEAD_EVENT_PUBLISHER, useClass: LeadEventPublisher },
    ...LEAD_LISTENERS,
  ],
  exports: [LEAD_EVENT_PUBLISHER],
})
export class LeadEventModule {}
