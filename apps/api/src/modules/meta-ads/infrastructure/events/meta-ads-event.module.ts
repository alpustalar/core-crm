import { Module } from '@nestjs/common';
import {
  MetaAccountConnectedListener,
  MetaLeadReceivedListener,
} from './listeners';
import {
  META_ADS_EVENT_PUBLISHER,
} from '@modules/meta-ads/domain/interfaces/meta-ads-event-publisher.interface';
import { MetaAdsEventPublisher } from './meta-ads-event-publisher.service';
import { AuditLogModule } from '@modules/audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  providers: [
    MetaAccountConnectedListener,
    MetaLeadReceivedListener,
    {
      provide: META_ADS_EVENT_PUBLISHER,
      useClass: MetaAdsEventPublisher,
    },
  ],
  exports: [META_ADS_EVENT_PUBLISHER],
})
export class MetaAdsEventModule {}
