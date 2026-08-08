import { Module } from '@nestjs/common';
import { CashRegisterPresentationModule } from './presentation/presentation.module';

@Module({ imports: [CashRegisterPresentationModule] })
export class CashRegisterModule {}
