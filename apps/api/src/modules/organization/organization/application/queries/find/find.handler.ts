import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindQuery } from './find.query';
import { FindQueryResponse } from './find.response';
import { Inject, NotFoundException } from '@nestjs/common';

import { Organization } from '@modules/organization/organization/domain/entities/organization.entity';
import {
  IOrganizationQueryRepository,
  ORGANIZATION_QUERY_REPOSITORY,
} from '@modules/organization/organization/domain/repositories/organization.repository.interface';

@QueryHandler(FindQuery)
export class FindHandler
  implements IQueryHandler<FindQuery, FindQueryResponse>
{
  constructor(
    @Inject(ORGANIZATION_QUERY_REPOSITORY)
    private readonly orgRepo: IOrganizationQueryRepository
  ) {}

  async execute(query: FindQuery): Promise<FindQueryResponse> {
    const { organizationId, ctx } = query;
    const { actor } = ctx;
    let organization: Organization | null;
    if (organizationId) {
      organization = await this.orgRepo.findOneByIdByOwner(
        actor.userId,
        organizationId
      );
    } else {
      organization = await this.orgRepo.findFirstByOwnerCredentials(
        actor.userId
      );
    }
    if (!organization) {
      throw new NotFoundException('Organizasyon bulunamadı');
    }
    return {
      data: organization.toPersistence(),
    };
  }
}
