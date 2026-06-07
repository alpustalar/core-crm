import { Module } from '@nestjs/common';
import {
  MetaAccountConnectedListener,
  MetaLeadConversionListener,
  MetaLeadReceivedListener,
} from './listeners';
import { META_ADS_EVENT_PUBLISHER } from '@modules/crm/meta-ads/domain/interfaces/meta-ads-event-publisher.interface';
import { MetaAdsEventPublisher } from './meta-ads-event-publisher.service';
import { AuditLogModule } from '@modules/platform/audit-log/audit-log.module';
import { MetaLeadRepositoryModule } from '@modules/crm/meta-ads/infrastructure/persistence/prisma/repositories/meta-lead/meta-lead.repository.module';

@Module({
  imports: [AuditLogModule, MetaLeadRepositoryModule],
  providers: [
    MetaAccountConnectedListener,
    MetaLeadReceivedListener,
    MetaLeadConversionListener,
    {
      provide: META_ADS_EVENT_PUBLISHER,
      useClass: MetaAdsEventPublisher,
    },
  ],
  exports: [META_ADS_EVENT_PUBLISHER],
})
export class MetaAdsEventModule {}
