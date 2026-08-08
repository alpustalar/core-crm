import { Module } from '@nestjs/common';
import { TaxParameterPresentationModule } from './presentation/presentation.module';

@Module({ imports: [TaxParameterPresentationModule] })
export class TaxParameterModule {}
