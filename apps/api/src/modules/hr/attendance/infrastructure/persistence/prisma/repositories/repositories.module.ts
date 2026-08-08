import { Module } from '@nestjs/common';
import { AttendanceRecordRepositoryModule } from '@modules/hr/attendance/infrastructure/persistence/prisma/repositories/attendance-record/attendance-record.repository.module';

const AttendanceRepositoriesModules = [AttendanceRecordRepositoryModule];

@Module({
  imports: [...AttendanceRepositoriesModules],
  exports: [...AttendanceRepositoriesModules],
})
export class AttendanceRepositoriesModule {}
