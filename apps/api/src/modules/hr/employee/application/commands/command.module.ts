import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EmployeeRepositoryModule } from '@modules/hr/employee/infrastructure/persistence/prisma/repositories/employee.repository.module';
import { EmployeeEventModule } from '@modules/hr/employee/infrastructure/events/employee-event.module';
import { CreateEmployeeHandler } from './create-employee/create-employee.handler';
import { UpdateEmployeeHandler } from './update-employee/update-employee.handler';
import { TerminateEmployeeHandler } from './terminate-employee/terminate-employee.handler';
import { AddEmployeeContractHandler } from './add-employee-contract/add-employee-contract.handler';

export const EMPLOYEE_COMMAND_HANDLERS = [
  CreateEmployeeHandler,
  UpdateEmployeeHandler,
  TerminateEmployeeHandler,
  AddEmployeeContractHandler,
];

@Module({
  imports: [CqrsModule, EmployeeRepositoryModule, EmployeeEventModule],
  providers: EMPLOYEE_COMMAND_HANDLERS,
  exports: EMPLOYEE_COMMAND_HANDLERS,
})
export class EmployeeCommandModule {}
