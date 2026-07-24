import { EMPLOYEE_EVENTS } from '@src/domain/constants/events/employee.constant';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface EmployeeTerminatedEventPayload extends IAuditLog {
  readonly employeeId: string;
  readonly clinicId: string;
  readonly terminationDate: Date;
}

export class EmployeeTerminatedEvent extends BaseEvent {
  static readonly NAME = EMPLOYEE_EVENTS.TERMINATE;

  public readonly employeeId: string;
  public readonly clinicId: string;
  public readonly terminationDate: Date;

  constructor(payload: EmployeeTerminatedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.employeeId = payload.employeeId;
    this.clinicId = payload.clinicId;
    this.terminationDate = payload.terminationDate;
  }
}
