import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ITaxParameterQueryRepository,
  TAX_PARAMETER_QUERY_REPOSITORY,
} from '@modules/finance/accounting/tax-parameters/domain/repositories/tax-parameter.repository';
import { GetTaxParametersQuery } from './get-tax-parameters.query';
import { GetTaxParametersResponse } from './get-tax-parameters.response';

@QueryHandler(GetTaxParametersQuery)
export class GetTaxParametersHandler
  implements IQueryHandler<GetTaxParametersQuery, GetTaxParametersResponse>
{
  constructor(
    @Inject(TAX_PARAMETER_QUERY_REPOSITORY)
    private readonly taxParameterQueryRepo: ITaxParameterQueryRepository
  ) {}

  async execute(
    query: GetTaxParametersQuery
  ): Promise<GetTaxParametersResponse> {
    const items = await this.taxParameterQueryRepo.findAllByClinicId(
      query.clinicId
    );
    return { data: items };
  }
}
