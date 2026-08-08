import { Module } from '@nestjs/common';
import { EmployeeRepositoriesModule } from '@modules/hr/employee/infrastructure/persistence/prisma/repositories/repositories.module';
import { GetEmployeesHandler } from './get-employees/get-employees.handler';
import { GetEmployeeByIdHandler } from './get-employee-by-id/get-employee-by-id.handler';

export const EMPLOYEE_QUERY_HANDLERS = [
  GetEmployeesHandler,
  GetEmployeeByIdHandler,
];

@Module({
  imports: [EmployeeRepositoriesModule],
  providers: EMPLOYEE_QUERY_HANDLERS,
})
export class EmployeeQueryModule {}
