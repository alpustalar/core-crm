import { Module } from '@nestjs/common';
import { LeavePresentationModule } from './presentation/presentation.module';

@Module({ imports: [LeavePresentationModule] })
export class LeaveModule {}
