import { Module } from '@nestjs/common';
import { WorkOrderPresentationModule } from './presentation/presentation.module';

@Module({ imports: [WorkOrderPresentationModule] })
export class WorkOrderModule {}
