import { Module } from '@nestjs/common';
import { BankPresentationModule } from './presentation/presentation.module';

@Module({ imports: [BankPresentationModule] })
export class BankModule {}
