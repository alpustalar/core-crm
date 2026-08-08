import { Module } from '@nestjs/common';
import { EmployeeController } from '@modules/hr/employee/presentation/http/controllers/employee.controller';

@Module({ controllers: [EmployeeController] })
export class EmployeePresentationModule {}
