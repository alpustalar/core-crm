import { BaseEvent } from '@common/interfaces';
import { WORK_ORDER_EVENTS } from '@src/domain/constants/events/work-order.constant';

/** İş emri tedarikçiye gönderildi — termin takibi bu andan itibaren işler. */
export interface WorkOrderSentEventPayload {
  workOrderId: string;
  clinicId: string;
  supplierId: string;
  patientId: string | null;
  dueDate: Date;
}

export class WorkOrderSentEvent extends BaseEvent {
  static readonly NAME = WORK_ORDER_EVENTS.SENT;

  public readonly workOrderId: string;
  public readonly clinicId: string;
  public readonly supplierId: string;
  public readonly patientId: string | null;
  public readonly dueDate: Date;

  constructor(payload: WorkOrderSentEventPayload) {
    super();
    this.workOrderId = payload.workOrderId;
    this.clinicId = payload.clinicId;
    this.supplierId = payload.supplierId;
    this.patientId = payload.patientId;
    this.dueDate = payload.dueDate;
  }
}
