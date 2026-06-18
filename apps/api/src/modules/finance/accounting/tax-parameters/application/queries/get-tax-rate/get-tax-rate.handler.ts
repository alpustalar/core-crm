import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ITaxParameterQueryRepository,
  TAX_PARAMETER_QUERY_REPOSITORY,
} from '@modules/finance/accounting/tax-parameters/domain/repositories/tax-parameter.repository';
import { TaxParameterNotConfiguredException } from '@modules/finance/accounting/tax-parameters/domain/exceptions/tax-parameter-not-configured.exception';
import { GetTaxRateQuery } from './get-tax-rate.query';
import { GetTaxRateResponse } from './get-tax-rate.response';

@QueryHandler(GetTaxRateQuery)
export class GetTaxRateHandler
  implements IQueryHandler<GetTaxRateQuery, GetTaxRateResponse>
{
  constructor(
    @Inject(TAX_PARAMETER_QUERY_REPOSITORY)
    private readonly taxParameterQueryRepo: ITaxParameterQueryRepository
  ) {}

  async execute(query: GetTaxRateQuery): Promise<GetTaxRateResponse> {
    const { clinicId, key, date } = query;

    const effective = await this.taxParameterQueryRepo.findEffective(
      clinicId,
      key,
      date
    );

    if (!effective) {
      throw new TaxParameterNotConfiguredException(clinicId, key);
    }

    return { data: { key, rate: effective.rateNumber } };
  }
}
