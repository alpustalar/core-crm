import { Module } from '@nestjs/common';
import { EmployeeController } from './controllers/employee.controller';
import { EmployeeCommandModule } from '@modules/hr/employee/application/commands/command.module';
import { EmployeeQueryModule } from '@modules/hr/employee/application/queries/query.module';

@Module({
  imports: [EmployeeCommandModule, EmployeeQueryModule],
  controllers: [EmployeeController],
})
export class EmployeePresentationModule {}
