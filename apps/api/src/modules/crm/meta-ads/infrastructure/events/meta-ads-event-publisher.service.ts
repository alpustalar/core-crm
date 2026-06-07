import { Inject, Injectable } from '@nestjs/common';
import {
  MetaAccountConnectedEvent,
  MetaAccountConnectedEventPayload,
  MetaLeadReceivedEvent,
  MetaLeadReceivedEventPayload,
} from '@modules/crm/meta-ads/domain/events';
import { IMetaAdsEventPublisher } from '@modules/crm/meta-ads/domain/interfaces/meta-ads-event-publisher.interface';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/domain/interfaces/context.service.interface';

@Injectable()
export class MetaAdsEventPublisher implements IMetaAdsEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService
  ) {}

  accountConnected(payload: MetaAccountConnectedEventPayload): void {
    this.contextService.addEvent(new MetaAccountConnectedEvent(payload));
  }

  leadReceived(payload: MetaLeadReceivedEventPayload): void {
    this.contextService.addEvent(new MetaLeadReceivedEvent(payload));
  }
}
