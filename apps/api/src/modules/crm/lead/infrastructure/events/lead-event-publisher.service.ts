import { Inject, Injectable } from '@nestjs/common';
import {
  LeadConvertedEvent,
  LeadConvertedEventPayload,
  LeadCreatedEvent,
  LeadCreatedEventPayload,
  LeadLostEvent,
  LeadLostEventPayload,
  LeadStatusChangedEvent,
  LeadStatusChangedEventPayload,
} from '@modules/crm/lead/domain/events';
import { ILeadEventPublisher } from '@modules/crm/lead/domain/interfaces/lead-event-publisher.interface';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/domain/interfaces/context.service.interface';

@Injectable()
export class LeadEventPublisher implements ILeadEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService
  ) {}

  leadCreated(payload: LeadCreatedEventPayload): void {
    this.contextService.addEvent(new LeadCreatedEvent(payload));
  }

  leadStatusChanged(payload: LeadStatusChangedEventPayload): void {
    this.contextService.addEvent(new LeadStatusChangedEvent(payload));
  }

  leadConverted(payload: LeadConvertedEventPayload): void {
    this.contextService.addEvent(new LeadConvertedEvent(payload));
  }

  leadLost(payload: LeadLostEventPayload): void {
    this.contextService.addEvent(new LeadLostEvent(payload));
  }
}
