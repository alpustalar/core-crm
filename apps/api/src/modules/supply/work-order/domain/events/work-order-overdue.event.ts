import { BaseEvent } from '@common/interfaces';
import { WORK_ORDER_EVENTS } from '@src/domain/constants/events/work-order.constant';

/**
 * İş emri termini geçti. Tarama işi bunu bir kez fırlatır (entity `overdueNotifiedAt`
 * ile idempotency sağlar); `platform/notification` personel bildirimine çevirir.
 */
export interface WorkOrderOverdueEventPayload {
  workOrderId: string;
  clinicId: string;
  supplierId: string;
  patientId: string | null;
  dueDate: Date;
  daysOverdue: number;
}

export class WorkOrderOverdueEvent extends BaseEvent {
  static readonly NAME = WORK_ORDER_EVENTS.OVERDUE;

  public readonly workOrderId: string;
  public readonly clinicId: string;
  public readonly supplierId: string;
  public readonly patientId: string | null;
  public readonly dueDate: Date;
  public readonly daysOverdue: number;

  constructor(payload: WorkOrderOverdueEventPayload) {
    super();
    this.workOrderId = payload.workOrderId;
    this.clinicId = payload.clinicId;
    this.supplierId = payload.supplierId;
    this.patientId = payload.patientId;
    this.dueDate = payload.dueDate;
    this.daysOverdue = payload.daysOverdue;
  }
}
