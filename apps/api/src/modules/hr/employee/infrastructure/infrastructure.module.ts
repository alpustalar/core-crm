import { Module } from '@nestjs/common';
import { EmployeeEventModule } from '@modules/hr/employee/infrastructure/messaging/events/employee-event.module';
import { EmployeeRepositoriesModule } from '@modules/hr/employee/infrastructure/persistence/prisma/repositories/repositories.module';

const EmployeeInfrastructureModules = [
  EmployeeEventModule,
  EmployeeRepositoriesModule,
];

@Module({
  imports: [...EmployeeInfrastructureModules],
  exports: [...EmployeeInfrastructureModules],
})
export class EmployeeInfrastructureModule {}