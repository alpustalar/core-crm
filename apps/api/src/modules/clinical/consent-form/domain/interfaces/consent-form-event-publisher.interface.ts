import {
  ConsentTemplateArchivedEventPayload,
  ConsentTemplateCreatedEventPayload,
  ConsentTemplateUpdatedEventPayload,
} from '@modules/clinical/consent-form/domain/events';

export const CONSENT_FORM_EVENT_PUBLISHER = Symbol(
  'IConsentFormEventPublisher'
);

export interface IConsentFormEventPublisher {
  templateCreated(payload: ConsentTemplateCreatedEventPayload): void;
  templateUpdated(payload: ConsentTemplateUpdatedEventPayload): void;
  templateArchived(payload: ConsentTemplateArchivedEventPayload): void;
}
