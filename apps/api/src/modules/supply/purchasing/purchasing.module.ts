import { Module } from '@nestjs/common';
import { PurchasingPresentationModule } from './presentation/presentation.module';

@Module({ imports: [PurchasingPresentationModule] })
export class PurchasingModule {}
