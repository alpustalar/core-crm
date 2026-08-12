import { Module } from '@nestjs/common';
import { TreatmentQueryModule } from './application/queries/query.module';

@Module({
  imports: [TreatmentQueryModule],
  controllers: [],
  providers: [],
  exports: [TreatmentQueryModule],
})
export class TreatmentModule {}
