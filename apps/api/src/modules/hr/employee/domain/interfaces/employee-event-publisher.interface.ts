import {
  EmployeeHiredEventPayload,
  EmployeeSalaryChangedEventPayload,
  EmployeeTerminatedEventPayload,
} from '@modules/hr/employee/domain/events';

export const EMPLOYEE_EVENT_PUBLISHER = Symbol('IEmployeeEventPublisher');

export interface IEmployeeEventPublisher {
  employeeHired(payload: EmployeeHiredEventPayload): void;
  employeeTerminated(payload: EmployeeTerminatedEventPayload): void;
  employeeSalaryChanged(payload: EmployeeSalaryChangedEventPayload): void;
}
