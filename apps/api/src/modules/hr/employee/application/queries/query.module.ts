import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EmployeeRepositoryModule } from '@modules/hr/employee/infrastructure/persistence/prisma/repositories/employee.repository.module';
import { GetEmployeesHandler } from './get-employees/get-employees.handler';
import { GetEmployeeByIdHandler } from './get-employee-by-id/get-employee-by-id.handler';

export const EMPLOYEE_QUERY_HANDLERS = [
  GetEmployeesHandler,
  GetEmployeeByIdHandler,
];

@Module({
  imports: [CqrsModule, EmployeeRepositoryModule],
  providers: EMPLOYEE_QUERY_HANDLERS,
  exports: EMPLOYEE_QUERY_HANDLERS,
})
export class EmployeeQueryModule {}
