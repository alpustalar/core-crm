import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PolicyFactory } from '@modules/platform/policy/application/policy-factory';
import {
  IProviderQueryRepository,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import { FindProviderByIdQuery } from './find-provider-by-id.query';
import { FindProviderByIdQueryResponse } from '@modules/clinical/provider/application/queries/find-provider-by-id/find-provider-by-id.response';

@QueryHandler(FindProviderByIdQuery)
export class FindProviderByIdHandler
  implements
    IQueryHandler<FindProviderByIdQuery, FindProviderByIdQueryResponse>
{
  constructor(
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository,
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(
    query: FindProviderByIdQuery
  ): Promise<FindProviderByIdQueryResponse> {
    const {
      providerId,
      ctx: { actor },
    } = query;

    const provider = await this.providerQueryRepo.findById(providerId);

    if (!provider) {
      throw new NotFoundException('Provider bulunamadı.');
    }

    const serializationOptions = this.policyFactory
      .user(actor)
      .policy.getUserSerializeOptions(provider.id, provider.clinicId);

    return { data: provider, meta: serializationOptions };
  }
}
