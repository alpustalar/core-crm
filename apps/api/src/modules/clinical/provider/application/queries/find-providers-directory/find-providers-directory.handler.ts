import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import { FindProvidersDirectoryQuery } from './find-providers-directory.query';
import { FindProvidersDirectoryQueryResponse } from './find-providers-directory.response';

@QueryHandler(FindProvidersDirectoryQuery)
export class FindProvidersDirectoryHandler
  implements
    IQueryHandler<
      FindProvidersDirectoryQuery,
      FindProvidersDirectoryQueryResponse
    >
{
  constructor(
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository
  ) {}

  async execute(
    query: FindProvidersDirectoryQuery
  ): Promise<FindProvidersDirectoryQueryResponse> {
    const data = await this.providerQueryRepo.findDirectoryByClinicId(
      query.clinicId
    );
    return { data };
  }
}
