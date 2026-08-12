import { Module } from '@nestjs/common';
import { CreateEmployeeHandler } from './create-employee/create-employee.handler';
import { UpdateEmployeeHandler } from './update-employee/update-employee.handler';
import { TerminateEmployeeHandler } from './terminate-employee/terminate-employee.handler';
import { AddEmployeeContractHandler } from './add-employee-contract/add-employee-contract.handler';
import { EmployeeInfrastructureModule } from '@modules/hr/employee/infrastructure/infrastructure.module';
import { ClinicDomainServicesModule } from '@modules/organization/clinic/domain/services/services.module';

export const EMPLOYEE_COMMAND_HANDLERS = [
  CreateEmployeeHandler,
  UpdateEmployeeHandler,
  TerminateEmployeeHandler,
  AddEmployeeContractHandler,
];

@Module({
  imports: [EmployeeInfrastructureModule, ClinicDomainServicesModule],
  providers: EMPLOYEE_COMMAND_HANDLERS,
})
export class EmployeeCommandModule {}
