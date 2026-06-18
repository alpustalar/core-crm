import { BaseEvent } from '@common/interfaces';
import { TREATMENT_PACKAGE_EVENTS } from '@src/domain/constants/events';

export interface TreatmentPackageDeletedEventPayload {
  readonly packageId: string;
  readonly clinicId: string;
}

export class TreatmentPackageDeletedEvent extends BaseEvent {
  static readonly NAME = TREATMENT_PACKAGE_EVENTS.SOFT_DELETED;

  public readonly packageId: string;
  public readonly clinicId: string;

  constructor(payload: TreatmentPackageDeletedEventPayload) {
    super();
    this.packageId = payload.packageId;
    this.clinicId = payload.clinicId;
  }
}
