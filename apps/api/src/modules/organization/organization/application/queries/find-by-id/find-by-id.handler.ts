import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindByIdQuery } from './find-by-id.query';
import { FindByIdQueryResponse } from './find-by-id.response';
import { Inject, NotFoundException } from '@nestjs/common';

import { Organization as IOrganization } from '@shared';
import {
  IOrganizationQueryRepository,
  ORGANIZATION_QUERY_REPOSITORY,
} from '@modules/organization/organization/domain/repositories/organization/organization.query.repository';

@QueryHandler(FindByIdQuery)
export class FindByIdHandler
  implements IQueryHandler<FindByIdQuery, FindByIdQueryResponse>
{
  constructor(
    @Inject(ORGANIZATION_QUERY_REPOSITORY)
    private readonly organizationRepo: IOrganizationQueryRepository
  ) {}

  async execute(query: FindByIdQuery): Promise<FindByIdQueryResponse> {
    const { organizationId, ctx } = query;
    const { actor } = ctx;
    let organization: IOrganization | null;
    if (organizationId) {
      organization = await this.organizationRepo.findOneByIdByOwner(
        actor.userId,
        organizationId
      );
    } else {
      organization = await this.organizationRepo.findFirstByOwnerCredentials(
        actor.userId
      );
    }
    if (!organization) {
      throw new NotFoundException('Organizasyon bulunamadı');
    }
    return {
      data: organization,
    };
  }
}
