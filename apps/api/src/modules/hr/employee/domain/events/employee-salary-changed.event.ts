import { EMPLOYEE_EVENTS } from '@src/domain/constants/events/employee.constant';
import { BaseEvent } from '@common/interfaces';
import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { CurrencyType as Currency } from '@input-type-schemas/CurrencySchema';

export interface EmployeeSalaryChangedEventPayload extends IAuditLog {
  readonly employeeId: string;
  readonly clinicId: string;
  readonly contractId: string;
  readonly grossSalary: number;
  readonly currency: Currency;
}

export class EmployeeSalaryChangedEvent extends BaseEvent {
  static readonly NAME = EMPLOYEE_EVENTS.ADD_CONTRACT;

  public readonly employeeId: string;
  public readonly clinicId: string;
  public readonly contractId: string;
  public readonly grossSalary: number;
  public readonly currency: Currency;

  constructor(payload: EmployeeSalaryChangedEventPayload) {
    super({
      source: payload.source,
      action: payload.action,
      details: payload.details,
      actorId: payload.actorId,
      type: payload.type,
    });
    this.employeeId = payload.employeeId;
    this.clinicId = payload.clinicId;
    this.contractId = payload.contractId;
    this.grossSalary = payload.grossSalary;
    this.currency = payload.currency;
  }
}
