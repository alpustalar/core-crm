import { Module } from '@nestjs/common';
import { EmployeePresentationModule } from './presentation/employee.presentation.module';
import { EmployeeCommandModule } from './application/commands/command.module';
import { EmployeeQueryModule } from './application/queries/query.module';

@Module({
  imports: [
    EmployeePresentationModule,
    EmployeeCommandModule,
    EmployeeQueryModule,
  ],
  exports: [EmployeeCommandModule, EmployeeQueryModule],
})
export class EmployeeModule {}
