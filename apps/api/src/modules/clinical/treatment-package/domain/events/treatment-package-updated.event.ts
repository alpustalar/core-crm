import { BaseEvent } from '@common/interfaces';
import { TREATMENT_PACKAGE_EVENTS } from '@src/domain/constants/events';

export interface TreatmentPackageUpdatedEventPayload {
  readonly packageId: string;
  readonly clinicId: string;
}

export class TreatmentPackageUpdatedEvent extends BaseEvent {
  static readonly NAME = TREATMENT_PACKAGE_EVENTS.UPDATED;

  public readonly packageId: string;
  public readonly clinicId: string;

  constructor(payload: TreatmentPackageUpdatedEventPayload) {
    super();
    this.packageId = payload.packageId;
    this.clinicId = payload.clinicId;
  }
}
