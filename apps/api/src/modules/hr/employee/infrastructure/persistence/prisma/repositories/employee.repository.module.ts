import { Module } from '@nestjs/common';
import {
  EMPLOYEE_COMMAND_REPOSITORY,
  EMPLOYEE_CONTRACT_COMMAND_REPOSITORY,
  EMPLOYEE_QUERY_REPOSITORY,
} from '@modules/hr/employee/domain/repositories/employee.repository';
import { EmployeeCommandRepository } from './employee.command.repository';
import { EmployeeContractCommandRepository } from './employee-contract.command.repository';
import { EmployeeQueryRepository } from './employee.query.repository';

@Module({
  providers: [
    { provide: EMPLOYEE_COMMAND_REPOSITORY, useClass: EmployeeCommandRepository },
    {
      provide: EMPLOYEE_CONTRACT_COMMAND_REPOSITORY,
      useClass: EmployeeContractCommandRepository,
    },
    { provide: EMPLOYEE_QUERY_REPOSITORY, useClass: EmployeeQueryRepository },
  ],
  exports: [
    EMPLOYEE_COMMAND_REPOSITORY,
    EMPLOYEE_CONTRACT_COMMAND_REPOSITORY,
    EMPLOYEE_QUERY_REPOSITORY,
  ],
})
export class EmployeeRepositoryModule {}
