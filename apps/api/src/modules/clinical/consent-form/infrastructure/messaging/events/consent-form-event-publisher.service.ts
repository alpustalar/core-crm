import { Inject, Injectable } from '@nestjs/common';
import {
  ConsentTemplateArchivedEvent,
  ConsentTemplateArchivedEventPayload,
  ConsentTemplateCreatedEvent,
  ConsentTemplateCreatedEventPayload,
  ConsentTemplateUpdatedEvent,
  ConsentTemplateUpdatedEventPayload,
} from '@modules/clinical/consent-form/domain/events';
import { IConsentFormEventPublisher } from '@modules/clinical/consent-form/domain/interfaces/consent-form-event-publisher.interface';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/context.service.interface';

@Injectable()
export class ConsentFormEventPublisher implements IConsentFormEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService
  ) {}

  templateCreated(payload: ConsentTemplateCreatedEventPayload): void {
    this.contextService.addEvent(new ConsentTemplateCreatedEvent(payload));
  }

  templateUpdated(payload: ConsentTemplateUpdatedEventPayload): void {
    this.contextService.addEvent(new ConsentTemplateUpdatedEvent(payload));
  }

  templateArchived(payload: ConsentTemplateArchivedEventPayload): void {
    this.contextService.addEvent(new ConsentTemplateArchivedEvent(payload));
  }
}
