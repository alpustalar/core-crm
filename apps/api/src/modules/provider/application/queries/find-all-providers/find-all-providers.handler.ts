import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  IProvider,
  IProviderRepository,
  PROVIDER_REPO_TOKEN,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { FindAllProvidersQuery } from './find-all-providers.query';
import { QueryResult } from '@shared/common/response/response.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(FindAllProvidersQuery)
export class FindAllProvidersHandler
  implements
    IQueryHandler<FindAllProvidersQuery, QueryResult<IProvider[]>>
{
  constructor(
    @Inject(PROVIDER_REPO_TOKEN)
    private readonly providerRepo: IProviderRepository
  ) {}

  async execute(
    query: FindAllProvidersQuery
  ): Promise<QueryResult<IProvider[]>> {
    const {
      context: { actor },
      pagination,
    } = query;

    if (actor.ownedOrganizations?.length) {
      const ownedOrganizations = actor.ownedOrganizations;
      const organizationIds = ownedOrganizations.map((org) => org.id);
      const { items, total } = await this.providerRepo.findAllByOrganizationIds(
        pagination,
        organizationIds
      );
      return {
        data: items,
        meta: {
          pagination: buildPaginationMeta(pagination, total),
        },
      };
    }

    if (actor.managedClinics?.length) {
      const managedClinics = actor.managedClinics;
      const clinicIds = managedClinics.map((clinic) => clinic.id);
      const results = await Promise.all(
        clinicIds.map((id) =>
          this.providerRepo.findAllByClinicId(
            {
              ...pagination,
              page: 1,
              limit: 999999,
            },
            id
          )
        )
      );

      const allItems = results.flatMap((result) => result.items);
      const total = allItems.length;

      const start = (pagination.page - 1) * pagination.limit;
      const paginatedItems = allItems.slice(start, start + pagination.limit);

      return {
        data: paginatedItems,
        meta: {
          pagination: buildPaginationMeta(pagination, total),
        },
      };
    }

    if (!actor.clinicId) {
      throw new Error('Clinic ID bulunamadı');
    }

    const clinicId = actor.clinicId;
    const { items, total } = await this.providerRepo.findAllByClinicId(
      pagination,
      clinicId
    );

    return {
      data: items,
      meta: {
        pagination: buildPaginationMeta(pagination, total),
      },
    };
  }
}
