import { Module } from '@nestjs/common';
import { AttendancePresentationModule } from './presentation/presentation.module';

@Module({ imports: [AttendancePresentationModule] })
export class AttendanceModule {}
