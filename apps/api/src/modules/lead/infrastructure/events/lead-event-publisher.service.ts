import { Inject, Injectable } from '@nestjs/common';
import {
  LeadCreatedEvent,
  LeadCreatedEventPayload,
  LeadStatusChangedEvent,
  LeadStatusChangedEventPayload,
  LeadConvertedEvent,
  LeadConvertedEventPayload,
  LeadLostEvent,
  LeadLostEventPayload,
} from '@modules/lead/domain/events';
import { ILeadEventPublisher } from '@modules/lead/domain/interfaces/lead-event-publisher.interface';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/domain/interfaces/context.service.interface';

@Injectable()
export class LeadEventPublisher implements ILeadEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService,
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
