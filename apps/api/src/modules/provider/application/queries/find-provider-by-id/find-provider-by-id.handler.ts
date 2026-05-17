import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import {
  IProviderRepository,
  PROVIDER_REPO_TOKEN,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { FindProviderByIdQuery } from './find-provider-by-id.query';

@QueryHandler(FindProviderByIdQuery)
export class FindProviderByIdHandler
  implements IQueryHandler<FindProviderByIdQuery>
{
  constructor(
    @Inject(PROVIDER_REPO_TOKEN)
    private readonly providerRepo: IProviderRepository,
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(query: FindProviderByIdQuery) {
    const {
      providerId,
      context: { actor },
    } = query;

    const provider = await this.providerRepo.find(providerId);

    if (!provider) {
      throw new NotFoundException('Provider bulunamadı.');
    }

    const serializationOptions = this.policyFactory
      .user(actor)
      .policy.getUserSerializeOptions(provider.id, provider.clinicId);

    return {
      data: provider,
      meta: serializationOptions,
    };
  }
}
