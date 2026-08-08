import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetTaxParametersQuery } from './get-tax-parameters.query';
import { GetTaxParametersResponse } from './get-tax-parameters.response';
import {
  ITaxParameterQueryRepository,
  TAX_PARAMETER_QUERY_REPOSITORY,
} from '@modules/finance/accounting/tax-parameters/domain/repositories/tax-parameter/tax-parameter.query.repository';

@QueryHandler(GetTaxParametersQuery)
export class GetTaxParametersHandler
  implements IQueryHandler<GetTaxParametersQuery, GetTaxParametersResponse>
{
  constructor(
    @Inject(TAX_PARAMETER_QUERY_REPOSITORY)
    private readonly taxParameterRepo: ITaxParameterQueryRepository
  ) {}

  async execute(
    query: GetTaxParametersQuery
  ): Promise<GetTaxParametersResponse> {
    const items = await this.taxParameterRepo.findAllByClinicId(query.clinicId);
    return { data: items };
  }
}
