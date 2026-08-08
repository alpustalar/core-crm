import { BaseEvent } from '@common/interfaces';
import { WORK_ORDER_EVENTS } from '@src/domain/constants/events/work-order.constant';

/** Klinik iş emrini tedarikçiden teslim aldı. */
export interface WorkOrderReceivedEventPayload {
  workOrderId: string;
  clinicId: string;
  supplierId: string;
  patientId: string | null;
  /** Teslimde kesinleşen ücret (yoksa anlaşılan ücret). */
  cost: string | null;
  currency: string;
  /** Termin aşıldıysa gün cinsinden gecikme (aşılmadıysa 0). */
  delayInDays: number;
}

export class WorkOrderReceivedEvent extends BaseEvent {
  static readonly NAME = WORK_ORDER_EVENTS.RECEIVED;

  public readonly workOrderId: string;
  public readonly clinicId: string;
  public readonly supplierId: string;
  public readonly patientId: string | null;
  public readonly cost: string | null;
  public readonly currency: string;
  public readonly delayInDays: number;

  constructor(payload: WorkOrderReceivedEventPayload) {
    super();
    this.workOrderId = payload.workOrderId;
    this.clinicId = payload.clinicId;
    this.supplierId = payload.supplierId;
    this.patientId = payload.patientId;
    this.cost = payload.cost;
    this.currency = payload.currency;
    this.delayInDays = payload.delayInDays;
  }
}
