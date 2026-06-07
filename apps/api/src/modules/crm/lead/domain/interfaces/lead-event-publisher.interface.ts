import {
  LeadConvertedEventPayload,
  LeadCreatedEventPayload,
  LeadLostEventPayload,
  LeadStatusChangedEventPayload,
} from '@modules/crm/lead/domain/events';

export const LEAD_EVENT_PUBLISHER = Symbol('ILeadEventPublisher');

export interface ILeadEventPublisher {
  leadCreated(payload: LeadCreatedEventPayload): void;
  leadStatusChanged(payload: LeadStatusChangedEventPayload): void;
  leadConverted(payload: LeadConvertedEventPayload): void;
  leadLost(payload: LeadLostEventPayload): void;
}
