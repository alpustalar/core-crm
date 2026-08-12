import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTreatmentPricingQuery } from './get-treatment-pricing.query';
import { GetTreatmentPricingResponse } from './get-treatment-pricing.response';
import {
  ITreatmentQueryRepository,
  TREATMENT_QUERY_REPOSITORY,
} from '@modules/clinical/treatment/domain/repositories/treatment/treatment.query.repository';

/**
 * Fiyat projeksiyonu tenant filtresi taşımaz: çağıran (charge handler) tedavinin
 * `clinicId`'sini randevunun kliniğiyle karşılaştırıp kapıyı kendisi tutar —
 * kontrol yazma tarafında, kararın verildiği yerde olmalıdır.
 */
@QueryHandler(GetTreatmentPricingQuery)
export class GetTreatmentPricingHandler
  implements
    IQueryHandler<GetTreatmentPricingQuery, GetTreatmentPricingResponse>
{
  constructor(
    @Inject(TREATMENT_QUERY_REPOSITORY)
    private readonly treatmentRepo: ITreatmentQueryRepository
  ) {}

  async execute(
    query: GetTreatmentPricingQuery
  ): Promise<GetTreatmentPricingResponse> {
    return {
      data: await this.treatmentRepo.findPricingById(query.treatmentId),
    };
  }
}
