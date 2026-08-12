import { Inject, Injectable } from '@nestjs/common';
import {
  MetaLeadReceivedEvent,
  MetaLeadReceivedEventPayload,
} from '@modules/crm/meta-ads/domain/events';
import { IMetaAdsEventPublisher } from '@modules/crm/meta-ads/domain/interfaces/meta-ads-event-publisher.interface';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/context.service.interface';

@Injectable()
export class MetaAdsEventPublisher implements IMetaAdsEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService
  ) {}

  leadReceived(payload: MetaLeadReceivedEventPayload): void {
    this.contextService.addEvent(new MetaLeadReceivedEvent(payload));
  }
}
