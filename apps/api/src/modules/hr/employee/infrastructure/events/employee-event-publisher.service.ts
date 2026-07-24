import { Inject, Injectable } from '@nestjs/common';
import {
  EmployeeHiredEvent,
  EmployeeHiredEventPayload,
  EmployeeSalaryChangedEvent,
  EmployeeSalaryChangedEventPayload,
  EmployeeTerminatedEvent,
  EmployeeTerminatedEventPayload,
} from '@modules/hr/employee/domain/events';
import { IEmployeeEventPublisher } from '@modules/hr/employee/domain/interfaces/employee-event-publisher.interface';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/context.service.interface';

@Injectable()
export class EmployeeEventPublisher implements IEmployeeEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService
  ) {}

  employeeHired(payload: EmployeeHiredEventPayload): void {
    this.contextService.addEvent(new EmployeeHiredEvent(payload));
  }

  employeeTerminated(payload: EmployeeTerminatedEventPayload): void {
    this.contextService.addEvent(new EmployeeTerminatedEvent(payload));
  }

  employeeSalaryChanged(payload: EmployeeSalaryChangedEventPayload): void {
    this.contextService.addEvent(new EmployeeSalaryChangedEvent(payload));
  }
}
