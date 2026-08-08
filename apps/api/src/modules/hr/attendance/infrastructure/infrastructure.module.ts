import { Module } from '@nestjs/common';
import { AttendanceRepositoriesModule } from '@modules/hr/attendance/infrastructure/persistence/prisma/repositories/repositories.module';

const AttendanceInfrastructureModules = [AttendanceRepositoriesModule];

@Module({
  imports: [...AttendanceInfrastructureModules],
  exports: [...AttendanceInfrastructureModules],
})
export class AttendanceInfrastructureModule {}
