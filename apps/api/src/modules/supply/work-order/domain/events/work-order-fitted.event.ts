import { BaseEvent } from '@common/interfaces';
import { WORK_ORDER_EVENTS } from '@src/domain/constants/events/work-order.constant';

/** İş emri hastaya uygulandı (terminal). */
export interface WorkOrderFittedEventPayload {
  workOrderId: string;
  clinicId: string;
  patientId: string | null;
  treatmentId: string | null;
  appointmentId: string | null;
}

export class WorkOrderFittedEvent extends BaseEvent {
  static readonly NAME = WORK_ORDER_EVENTS.FITTED;

  public readonly workOrderId: string;
  public readonly clinicId: string;
  public readonly patientId: string | null;
  public readonly treatmentId: string | null;
  public readonly appointmentId: string | null;

  constructor(payload: WorkOrderFittedEventPayload) {
    super();
    this.workOrderId = payload.workOrderId;
    this.clinicId = payload.clinicId;
    this.patientId = payload.patientId;
    this.treatmentId = payload.treatmentId;
    this.appointmentId = payload.appointmentId;
  }
}
