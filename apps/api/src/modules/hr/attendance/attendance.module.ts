import { Module } from '@nestjs/common';
import { AttendancePresentationModule } from './presentation/attendance.presentation.module';
import { AttendanceCommandModule } from './application/commands/command.module';
import { AttendanceQueryModule } from './application/queries/query.module';

@Module({
  imports: [
    AttendancePresentationModule,
    AttendanceCommandModule,
    AttendanceQueryModule,
  ],
  exports: [AttendanceCommandModule, AttendanceQueryModule],
})
export class AttendanceModule {}
