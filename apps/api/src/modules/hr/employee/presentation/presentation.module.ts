import { Module } from '@nestjs/common';
import { EmployeeQueryController } from '@modules/hr/employee/presentation/http/controllers/employee.query.controller';
import { EmployeeCommandController } from '@modules/hr/employee/presentation/http/controllers/employee.command.controller';

@Module({ controllers: [EmployeeQueryController, EmployeeCommandController] })
export class EmployeePresentationModule {}
