import { IEvent } from '@nestjs/cqrs';
import { LogSource } from '@src/domain/constants/log-action.constant';
import { CLINIC_EVENTS } from '@src/domain/constants/events';

export interface IClinicCreatedEvent {
  readonly clinicId: string;
  readonly organizationId?: string;
  readonly userId?: string;
  readonly source?: LogSource;
  readonly correlationId?: string;
}

export class ClinicCreatedEvent implements IEvent {
  static readonly NAME = CLINIC_EVENTS.CREATED;

  public readonly clinicId: string;
  public readonly organizationId?: string;
  public readonly userId?: string;
  public readonly source?: LogSource;
  public readonly correlationId?: string;
  public readonly occurredAt: Date;

  constructor(event: IClinicCreatedEvent) {
    this.clinicId = event.clinicId;
    this.organizationId = event.organizationId;
    this.userId = event.userId;
    this.source = event.source || LogSource.SYSTEM;
    this.correlationId = event.correlationId;
    this.occurredAt = new Date();
  }
}
