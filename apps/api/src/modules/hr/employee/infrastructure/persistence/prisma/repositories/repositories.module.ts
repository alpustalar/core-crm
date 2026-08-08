import { Module } from '@nestjs/common';
import { EmployeeCommandRepository } from './employee/employee.command.repository';
import { EmployeeContractCommandRepository } from './employee-contract/employee-contract.command.repository';
import { EmployeeQueryRepository } from './employee/employee.query.repository';
import { EMPLOYEE_COMMAND_REPOSITORY } from '@modules/hr/employee/domain/repositories/employee/employee.command.repository';
import { EMPLOYEE_CONTRACT_COMMAND_REPOSITORY } from '@modules/hr/employee/domain/repositories/employee-contract/employee-contract.command.repository';
import { EMPLOYEE_QUERY_REPOSITORY } from '@modules/hr/employee/domain/repositories/employee/employee.query.repository';

@Module({
  providers: [
    {
      provide: EMPLOYEE_COMMAND_REPOSITORY,
      useClass: EmployeeCommandRepository,
    },
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
export class EmployeeRepositoriesModule {}
