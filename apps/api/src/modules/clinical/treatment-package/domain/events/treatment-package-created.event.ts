import { BaseEvent } from '@common/interfaces';
import { TREATMENT_PACKAGE_EVENTS } from '@src/domain/constants/events';

export interface TreatmentPackageCreatedEventPayload {
  readonly packageId: string;
  readonly clinicId: string;
  readonly name: string;
}

export class TreatmentPackageCreatedEvent extends BaseEvent {
  static readonly NAME = TREATMENT_PACKAGE_EVENTS.CREATED;

  public readonly packageId: string;
  public readonly clinicId: string;
  public readonly name: string;

  constructor(payload: TreatmentPackageCreatedEventPayload) {
    super();
    this.packageId = payload.packageId;
    this.clinicId = payload.clinicId;
    this.name = payload.name;
  }
}
