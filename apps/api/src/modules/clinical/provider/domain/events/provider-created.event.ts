import { BaseEvent } from '@common/interfaces';
import { PROVIDER_EVENTS } from '@src/domain/constants/events';

export interface ProviderCreatedEventPayload {
  providerId: string;
  clinicId: string;
  userId: string;
}

export class ProviderCreatedEvent extends BaseEvent {
  static readonly NAME = PROVIDER_EVENTS.CREATED;

  public readonly providerId: string;
  public readonly clinicId: string;
  public readonly userId: string;

  constructor(payload: ProviderCreatedEventPayload) {
    super();
    this.providerId = payload.providerId;
    this.clinicId = payload.clinicId;
    this.userId = payload.userId;
  }
}
