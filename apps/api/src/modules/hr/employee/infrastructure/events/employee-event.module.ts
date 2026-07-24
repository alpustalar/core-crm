import { Module } from '@nestjs/common';
import { AuditLogModule } from '@modules/platform/audit-log/audit-log.module';
import { ContextModule } from '@src/infrastructure/context/context.module';
import { EMPLOYEE_EVENT_PUBLISHER } from '@modules/hr/employee/domain/interfaces/employee-event-publisher.interface';
import { EmployeeEventPublisher } from './employee-event-publisher.service';
import {
  EmployeeHiredListener,
  EmployeeSalaryChangedListener,
  EmployeeTerminatedListener,
} from './listeners';

export const EMPLOYEE_LISTENERS = [
  EmployeeHiredListener,
  EmployeeTerminatedListener,
  EmployeeSalaryChangedListener,
];

@Module({
  imports: [AuditLogModule, ContextModule],
  providers: [
    { provide: EMPLOYEE_EVENT_PUBLISHER, useClass: EmployeeEventPublisher },
    ...EMPLOYEE_LISTENERS,
  ],
  exports: [EMPLOYEE_EVENT_PUBLISHER],
})
export class EmployeeEventModule {}
