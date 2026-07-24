import { EMPLOYEE_EVENTS } from '@src/domain/constants/events/employee.constant';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface EmployeeHiredEventPayload extends IAuditLog {
  readonly employeeId: string;
  readonly organizationId: string;
  readonly clinicId: string;
}

export class EmployeeHiredEvent extends BaseEvent {
  static readonly NAME = EMPLOYEE_EVENTS.CREATE;

  public readonly employeeId: string;
  public readonly organizationId: string;
  public readonly clinicId: string;

  constructor(payload: EmployeeHiredEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.employeeId = payload.employeeId;
    this.organizationId = payload.organizationId;
    this.clinicId = payload.clinicId;
  }
}
