import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { BaseEvent } from '@common/interfaces';

export interface CancelAppointmentPayload extends IAuditLog {
  appointmentId: string;
}

export class CancelAppointmentEvent extends BaseEvent {
  public readonly appointmentId: string;
  constructor(payload: CancelAppointmentPayload) {
    super(payload);

    this.appointmentId = payload.appointmentId;
  }
}
