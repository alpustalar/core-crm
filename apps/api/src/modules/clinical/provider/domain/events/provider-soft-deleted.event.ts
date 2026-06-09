import { BaseEvent } from '@common/interfaces';
import { PROVIDER_EVENTS } from '@src/domain/constants/events';

export interface ProviderSoftDeletedEventPayload {
  providerId: string;
  clinicId: string;
  userId: string;
}

export class ProviderSoftDeletedEvent extends BaseEvent {
  static readonly NAME = PROVIDER_EVENTS.SOFT_DELETED;

  public readonly providerId: string;
  public readonly clinicId: string;
  public readonly userId: string;

  constructor(payload: ProviderSoftDeletedEventPayload) {
    super();
    this.providerId = payload.providerId;
    this.clinicId = payload.clinicId;
    this.userId = payload.userId;
  }
}
