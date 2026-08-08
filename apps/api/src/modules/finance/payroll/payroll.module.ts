import { Module } from '@nestjs/common';
import { PayrollPresentationModule } from './presentation/presentation.module';

@Module({ imports: [PayrollPresentationModule] })
export class PayrollModule {}
