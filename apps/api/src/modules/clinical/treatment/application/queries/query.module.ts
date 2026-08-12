import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetTreatmentPricingHandler } from './get-treatment-pricing/get-treatment-pricing.handler';
import { TreatmentRepositoryModule } from '@modules/clinical/treatment/infrastructure/persistence/prisma/repositories/treatment/treatment.repository.module';

export const TREATMENT_QUERY_HANDLERS = [GetTreatmentPricingHandler];

@Module({
  imports: [CqrsModule, TreatmentRepositoryModule],
  providers: TREATMENT_QUERY_HANDLERS,
  exports: TREATMENT_QUERY_HANDLERS,
})
export class TreatmentQueryModule {}
